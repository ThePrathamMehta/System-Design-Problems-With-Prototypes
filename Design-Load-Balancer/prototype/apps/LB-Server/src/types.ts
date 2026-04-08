export interface BackendServer {
    host : string;
    port : number;
    alive : boolean;
}

export enum LBAlogithms {
    RoundRobin,
    WeightedRoundRobin,
    LeastConnections
}