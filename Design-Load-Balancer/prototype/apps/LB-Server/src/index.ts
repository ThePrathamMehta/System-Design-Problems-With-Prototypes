import { LoadBalancer } from './LB';
import { LBAlgorithms } from './types';
import type { BackendServer } from './types';

const backends: BackendServer[] = [
  { host: '127.0.0.1', port: 3001, alive: true, weight: 3 }, 
  { host: '127.0.0.1', port: 3002, alive: true, weight: 2 },
  { host: '127.0.0.1', port: 3003, alive: true, weight: 1 },
];

const algorithm = LBAlgorithms.LeastConnections;

const lb = new LoadBalancer(backends, algorithm);
lb.initServer();
