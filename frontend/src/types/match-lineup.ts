import type { Match } from './match';
import type { Team } from './team';
import type { Player } from './player';

/**
 * Represents a position on the playing field.
 */
export type LineupPosition = 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD';

/**
 * Represents an individual entry in a match lineup.
 */
export interface MatchLineup {
    id: number;
    matchId: number;
    teamId: number;
    playerId: number;
    starter: boolean;
    shirtNumber?: number | null;
    position?: LineupPosition | string | null;
    match?: Match;
    team?: Team;
    player?: Player;
}

/**
 * Represents the individual player entry when registering a lineup.
 */
export interface LineupPlayerInput {
    playerId: number;
    starter: boolean;
    shirtNumber?: number;
    position?: LineupPosition | string;
}

/**
 * DTO for adding the full team lineup to a match.
 */
export interface AddTeamLineupDTO {
    teamId: number;
    players: LineupPlayerInput[];
}

/**
 * DTO for updating an individual lineup entry.
 */
export interface UpdateLineupEntryDTO {
    starter?: boolean;
    shirtNumber?: number;
    position?: LineupPosition | string;
}
