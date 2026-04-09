import net from 'net';
import type { BackendServer } from './types';
import { LBAlgorithms } from './types';

export class LoadBalancer {
  server: net.Server | null = null;
  currentIdx: number = 0;
  weightedIdx: number = 0;
  weightedPool: BackendServer[] = [];

  LB_HOST: string;
  LB_PORT: number;
  backends: BackendServer[];
  algorithm: LBAlgorithms;
  requestCount: Map<string, number> = new Map();

  constructor(backends: BackendServer[], algorithm: LBAlgorithms) {
    this.backends = backends.map((b) => ({
      ...b,
      weight: b.weight ?? 1,
      connections: 0,
    }));
    this.algorithm = algorithm;
    this.LB_HOST = '127.0.0.1';
    this.LB_PORT = Number(process.env.LB_PORT) || 8000;

    this.buildWeightedPool();

    this.checkHealth();
    setInterval(() => this.checkHealth(), 5000);
  }

  private buildWeightedPool() {
    this.weightedPool = [];
    for (const backend of this.backends) {
      const times = backend.weight ?? 1;
      for (let i = 0; i < times; i++) {
        this.weightedPool.push(backend);
      }
    }
  }

  private getRoundRobin(): BackendServer | null {
    const alive = this.backends.filter((b) => b.alive);
    if (alive.length === 0) return null;

    for (let i = 0; i < this.backends.length; i++) {
      const idx = (this.currentIdx + i) % this.backends.length;
      if (this.backends[idx].alive) {
        this.currentIdx = (idx + 1) % this.backends.length;
        return this.backends[idx];
      }
    }
    return null;
  }

  private getWeightedRoundRobin(): BackendServer | null {
    const alivePool = this.weightedPool.filter((b) => b.alive);
    if (alivePool.length === 0) return null;

    const backend = alivePool[this.weightedIdx % alivePool.length];
    this.weightedIdx = (this.weightedIdx + 1) % alivePool.length;
    return backend;
  }


  private getLeastConnections(): BackendServer | null {
    const alive = this.backends.filter((b) => b.alive);
    if (alive.length === 0) return null;

    return alive.reduce((min, b) => ((b.connections ?? 0) < (min.connections ?? 0) ? b : min));
  }

  getNextBackend(): BackendServer | null {
    switch (this.algorithm) {
      case LBAlgorithms.RoundRobin:
        return this.getRoundRobin();
      case LBAlgorithms.WeightedRoundRobin:
        return this.getWeightedRoundRobin();
      case LBAlgorithms.LeastConnections:
        return this.getLeastConnections();
      default:
        return this.getRoundRobin();
    }
  }

  initServer() {
    this.server = net.createServer((clientSocket) => {
      if (this.rateLimiter(clientSocket)) return;
      const backend = this.getNextBackend();
      if (!backend) {
        clientSocket.end('HTTP/1.1 503 Service Unavailable\r\n\r\nNo healthy backends.');
        return;
      }
      backend.connections = (backend.connections ?? 0) + 1;
      const backendSocket = net.createConnection(backend.port, backend.host, () => {
        console.log(`[LB] Routing to ${backend.host}:${backend.port}`);
      });
      clientSocket.pipe(backendSocket);
      backendSocket.pipe(clientSocket);
      const cleanup = () => {
        backend.connections = Math.max(0, (backend.connections ?? 1) - 1);
        clientSocket.destroy();
        backendSocket.destroy();
      };
      clientSocket.on('close', cleanup);
      backendSocket.on('close', cleanup);
      clientSocket.on('error', (err) => {
        console.error(`[Client Error] ${err.message}`);
        cleanup();
      });
      backendSocket.on('error', (err) => {
        console.error(`[Backend Error] ${backend.host}:${backend.port} — ${err.message}`);
        backend.alive = false;
        cleanup();
      });
    });
    this.server.listen(this.LB_PORT, this.LB_HOST, () => {
      console.log(`[LB] Load Balancer running on ${this.LB_HOST}:${this.LB_PORT}`);
      console.log(`[LB] Algorithm: ${LBAlgorithms[this.algorithm]}`);
    });
  }

  checkHealth() {
    this.backends.forEach((backend) => {
      const socket = net.createConnection(backend.port, backend.host);
      socket.on('connect', () => {
        if (!backend.alive) {
          console.log(`[Health] ${backend.host}:${backend.port} recovered`);
        }
        backend.alive = true;
        socket.destroy();
      });
      socket.on('error', () => {
        if (backend.alive) {
          console.warn(`[Health] ${backend.host}:${backend.port} is DOWN`);
        }
        backend.alive = false;
      });
    });
  }

  rateLimiter(clientSocket: net.Socket): boolean {
    const ip = clientSocket.remoteAddress ?? 'unknown';
    const count = (this.requestCount.get(ip) ?? 0) + 1;
    this.requestCount.set(ip, count);

    if (count === 1) {
      setTimeout(() => this.requestCount.delete(ip), 60_000);
    }

    if (count > 100) {
      console.warn(`[Rate Limit] Blocked ${ip} (${count} requests)`);
      clientSocket.end('HTTP/1.1 429 Too Many Requests\r\n\r\nRate limit exceeded.');
      return true;
    }

    return false;
  }
}
