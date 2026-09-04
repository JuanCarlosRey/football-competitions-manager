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