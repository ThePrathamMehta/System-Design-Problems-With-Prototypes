import type { BackendServer } from './types';
import { LBAlogithms } from './types';
import net from 'net';

class LoadBalancer {
    
  server: any;
  currentIdx: number;
  LB_HOST: string;
  LB_PORT: number;
  backends: BackendServer[];
  configuredAlgorithm: LBAlogithms;
  requestCount: Map<string, number>;

  constructor(backends: BackendServer[], algorithm: LBAlogithms) {
    this.backends = backends;
    this.currentIdx = 0;
    this.LB_HOST = '127.0.0.1';
    this.LB_PORT = Number(process.env.LB_PORT) || 8000;
    this.configuredAlgorithm = algorithm;
    this.requestCount = new Map();
    this.checkHealth();
    setInterval(() => {
      this.checkHealth();
    }, 5000);
  }

  initServer() {
    this.server = net.createServer((clientSocket) => {
      this.rateLimiter(clientSocket);
      const backend = this.getNextBackend();
      if (!backend) return;
      const backendSocket = net.createConnection(backend.port, backend.host, () => {
        console.log('tunnel for backend created');
      });
      clientSocket.on('error', (err) => {
        console.error('Client socket error:', err.message);
        backendSocket.destroy();
      });
      backendSocket.on('error', (err) => {
        console.error('Client socket error:', err.message);
        backendSocket.destroy();
      });
      clientSocket.pipe(backendSocket);
      backendSocket.pipe(clientSocket);
    });
    this.server.listen(this.LB_PORT, this.LB_HOST, () => {
      console.log('Load Balancer Running');
    });
  }

  getNextBackend() {
    let backend;
    for (let i = this.currentIdx; i < this.backends.length; i++) {
      if (this.backends[i].alive) {
        backend = this.backends[i];
        break;
      }
    }
    this.currentIdx = (this.currentIdx + 1) % this.backends.length;
    return backend;
  }

  checkHealth() {
    this.backends.forEach((backend) => {
      const socket = net.createConnection(backend.port, backend.host);
      socket.on('connect', () => {
        backend.alive = true;
        socket.destroy();
      });
      socket.on('error', () => {
        backend.alive = false;
      });
    });
  }

  rateLimiter(clientSocket: any) {
    const ip = clientSocket.remoteAddress!;
    const count = this.requestCount.get(ip) || 0;
    if (count > 100) {
      clientSocket.end('Rate Limit Exceeded');
    }
    setTimeout(() => {
      this.requestCount.delete(ip);
    }, 60000);
  }
}

const backends = [
  { host: '127.0.0.1', port: 3001, alive: true },
  { host: '127.0.0.1', port: 3002, alive: true },
];

const algorithm: LBAlogithms = LBAlogithms.RoundRobin;

const loadBalancer = new LoadBalancer(backends, algorithm);
loadBalancer.initServer();
