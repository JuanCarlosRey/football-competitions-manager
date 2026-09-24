import type { Match } from './match';
import type { Player } from './player';

/**
 * Represents the individual statistics of a player in a specific match.
 */
export interface MatchPlayerStats {
    id: number;
    matchId: number;
    playerId: number;
    goals: number;
    goalsConceded: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    rating?: number | null;
    match?: Match;
    player?: Player;
}

/**
 * DTO for recording a player's statistics in a match.
 */
export interface CreateMatchPlayerStatsDTO {
    playerId: number;
    goals?: number;
    goalsConceded?: number;
    assists?: number;
    yellowCards?: number;
    redCards?: number;
    rating?: number | null;
}

/**
 * DTO for partially updating a player's statistics in a match.
 */
export interface UpdateMatchPlayerStatsDTO {
    goals?: number;
    goalsConceded?: number;
    assists?: number;
    yellowCards?: number;
    redCards?: number;
    rating?: number | null;
}