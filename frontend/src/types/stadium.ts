import type { Match } from "./match";
import type { Team } from "./team";

/**
 * Represents a stadium in the system.
 */
export interface Stadium {
    id: number;
    name: string;
    capacity: number;
    address: string;
    matches?: Array<Match>;
    teams?: Array<Team>;
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