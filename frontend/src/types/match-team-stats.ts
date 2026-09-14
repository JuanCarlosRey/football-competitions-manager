import type { Match } from './match';
import type { Team } from './team';
/**
 * Represents the complete statistics of a team in an individual match.
 */
export interface MatchTeamStats {
    id: number;
    matchId: number;
    teamId: number;
    possession: number;
    shots: number;
    shotsOnTarget: number;
    fouls: number;
    offsides: number;
    corners: number;
    freeKicks: number;
    passes: number;
    completedPasses: number;
    crosses: number;
    interceptions: number;
    tackles: number;
    saves: number;
    yellowCards: number;
    redCards: number;
    match?: Match;
    team?: Team;
}

/**
 * DTO for recording a team's statistics in a match.
 */
export interface CreateMatchTeamStatsDTO {
    teamId: number;
    possession: number;
    shots: number;
    shotsOnTarget: number;
    fouls: number;
    offsides: number;
    corners: number;
    freeKicks: number;
    passes: number;
    completedPasses: number;
    crosses: number;
    interceptions: number;
    tackles: number;
    saves: number;
    yellowCards: number;
    redCards: number;
}

/**
 * DTO for partially updating a team's statistics in a match.
 */
export interface UpdateMatchTeamStatsDTO {
    possession?: number;
    shots?: number;
    shotsOnTarget?: number;
    fouls?: number;
    offsides?: number;
    corners?: number;
    freeKicks?: number;
    passes?: number;
    completedPasses?: number;
    crosses?: number;
    interceptions?: number;
    tackles?: number;
    saves?: number;
    yellowCards?: number;
    redCards?: number;
}
