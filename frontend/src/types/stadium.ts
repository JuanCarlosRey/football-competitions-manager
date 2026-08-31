import type { Match } from "./match";

export interface Stadium {
    id: number;
    name: string;
    capacity: number;
    address: string;
    matches?: Array<Match>;
}

export interface CreateStadiumDTO {
    name: string;
    capacity: number;
    address: string;
}

export interface UpdateStadiumDTO {
    name?: string;
    capacity?: number;
    address?: string;
}