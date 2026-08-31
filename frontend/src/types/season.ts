import type { Match } from "./match";

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

export interface CreateSeasonDTO {
    startDate: string | Date;
    endDate: string | Date;
    competitionId: number;
}

export interface UpdateSeasonDTO {
    startDate?: string | Date;
    endDate?: string | Date;
    competitionId?: number;
}