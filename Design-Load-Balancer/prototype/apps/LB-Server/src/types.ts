export interface BackendServer {
  host: string;
  port: number;
  alive: boolean;
  weight?: number;
  connections?: number; 
}

export enum LBAlgorithms {
  RoundRobin,
  WeightedRoundRobin,
  LeastConnections,
}
