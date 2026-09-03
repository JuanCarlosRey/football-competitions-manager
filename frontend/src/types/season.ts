import type { Match } from "./match";

/**
 * Represents a season in the system.
 */
export interface Season {
    id: number;
    startDate: string;
    endDate: string;
    competitionId: number;
    competition?: {
        id: number;
        name: string;
        organizationId: number;
    };
    matches?: Array<Match>;
}

/**
 * Data Transfer Object for creating a new season.
 */
export interface CreateSeasonDTO {
    startDate: string | Date;
    endDate: string | Date;
    competitionId: number;
}

/**
 * Data Transfer Object for updating an existing season.
 */
export interface UpdateSeasonDTO {
    startDate?: string | Date;
    endDate?: string | Date;
    competitionId?: number;
}