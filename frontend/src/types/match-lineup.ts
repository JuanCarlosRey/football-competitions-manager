import type { Match } from './match';
import type { Team } from './team';
import type { Player } from './player';

/**
 * Representa una posición en el campo de juego.
 */
export type LineupPosition = 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD';

/**
 * Representa una entrada individual en la alineación de un partido.
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
 * Representa la entrada individual de un jugador al registrar una alineación.
 */
export interface LineupPlayerInput {
    playerId: number;
    starter: boolean;
    shirtNumber?: number;
    position?: LineupPosition | string;
}

/**
 * DTO para agregar la alineación completa de un equipo a un partido (POST /matches/:id/lineups).
 */
export interface AddTeamLineupDTO {
    teamId: number;
    players: LineupPlayerInput[];
}

/**
 * DTO para actualizar una entrada individual de la alineación (PUT /matches/:id/lineups/:lineupId).
 */
export interface UpdateLineupEntryDTO {
    starter?: boolean;
    shirtNumber?: number;
    position?: LineupPosition | string;
}