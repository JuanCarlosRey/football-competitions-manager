/**
 * Represents the preferred foot of a player.
 */
export type PreferredFoot = 'LEFT' | 'RIGHT' | 'BOTH';

/**
 * Represents a player in the system.
 */
export interface Player {
    id: number;
    firstName: string;
    lastName: string;
    birthDate: string | Date;
    position: string;
    nationality: string;
    overall: number;
    height: number;
    weight: number;
    preferredFoot: PreferredFoot;
    marketValue?: number | null;
    annualSalary?: number | null;
    currentTeam?: string | { id: number; name: string } | null;
}

/**
 * Data Transfer Object for creating a new player.
 */
export interface CreatePlayerDTO {
    firstName: string;
    lastName: string;
    birthDate: string | Date;
    position: string;
    nationality: string;
    overall: number;
    height: number;
    weight: number;
    preferredFoot: PreferredFoot;
    marketValue?: number | null;
    annualSalary?: number | null;
}

/**
 * Data Transfer Object for updating an existing player.
 */
export interface UpdatePlayerDTO {
    firstName?: string;
    lastName?: string;
    birthDate?: string | Date;
    position?: string;
    nationality?: string;
    overall?: number;
    height?: number;
    weight?: number;
    preferredFoot?: PreferredFoot;
    marketValue?: number | null;
    annualSalary?: number | null;
}

/**
 * Represents an entry in a player's career history.
 */
export interface PlayerCareerItem {
    team: string;
    startDate: string | Date;
    endDate?: string | Date | null;
}

/**
 * Represents a player's association with a specific team.
 */
export interface TeamPlayerRelation {
    id: number;
    teamId: number;
    playerId: number;
    startDate: string;
    endDate: string | null;
    team?: {
        id: number;
        name: string;
    };
    player?: Player;
}

/**
 * Data Transfer Object for assigning a player to a team.
 */
export interface AddPlayerToTeamDTO {
    playerId: number;
    startDate: string | Date;
}

/**
 * Data Transfer Object for updating player contract dates in a team.
 */
export interface UpdatePlayerTeamDatesDTO {
    endDate: string | Date;
}