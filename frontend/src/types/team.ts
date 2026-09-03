import type { Match } from "./match";

/**
 * Represents a team in the system.
 */
export interface Team {
    id: number;
    name: string;
    abbreviation: string;
    crest?: string | null;
    president?: string | null;
    homeMatches?: Array<Match>;
    awayMatches?: Array<Match>;
}

/**
 * Data Transfer Object for creating a new team.
 */
export interface CreateTeamDTO {
    name: string;
    abbreviation: string;
    crest?: string | null;
    president?: string | null;
}

/**
 * Data Transfer Object for updating an existing team.
 */
export interface UpdateTeamDTO {
    name?: string;
    abbreviation?: string;
    crest?: string | null;
    president?: string | null;
}