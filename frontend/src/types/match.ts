import type { Team } from './team';
import type { Season } from './season';
import type { Stadium } from './stadium';

/**
 * Represents the status of a match.
 */
export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED';

/**
 * Represents a match in the system.
 */
export interface Match {
    id: number;
    dateTime: string;
    status: MatchStatus;
    seasonId: number;
    stadiumId: number;
    homeTeamId: number;
    awayTeamId: number;
    season?: Season;
    stadium?: Stadium;
    homeTeam?: Team;
    awayTeam?: Team;
}

/**
 * Data Transfer Object for creating a new match.
 */
export interface CreateMatchDTO {
    dateTime: string;
    status: MatchStatus;
    seasonId: number;
    stadiumId: number;
    homeTeamId: number;
    awayTeamId: number;
}

/**
 * Data Transfer Object for updating an existing match.
 */
export interface UpdateMatchDTO {
    dateTime?: string;
    status?: MatchStatus;
    seasonId?: number;
    stadiumId?: number;
    homeTeamId?: number;
    awayTeamId?: number;
}