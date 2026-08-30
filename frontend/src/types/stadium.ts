export interface Stadium {
    id: number;
    name: string;
    capacity: number;
    address: string;
    matches?: Array<unknown>;
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