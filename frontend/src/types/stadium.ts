import type { Match } from "./match";

/**
 * Represents a stadium in the system.
 */
export interface Stadium {
    id: number;
    name: string;
    capacity: number;
    address: string;
    matches?: Array<Match>;
}

/**
 * Data Transfer Object for creating a new stadium.
 */
export interface CreateStadiumDTO {
    name: string;
    capacity: number;
    address: string;
}

/**
 * Data Transfer Object for updating an existing stadium.
 */
export interface UpdateStadiumDTO {
    name?: string;
    capacity?: number;
    address?: string;
}