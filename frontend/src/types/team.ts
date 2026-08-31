import type { Match } from "./match";

export interface Team {
    id: number;
    name: string;
    abbreviation: string;
    crest?: string | null;
    president?: string | null;
    homeMatches?: Array<Match>;
    awayMatches?: Array<Match>;
}

export interface CreateTeamDTO {
    name: string;
    abbreviation: string;
    crest?: string | null;
    president?: string | null;
}

export interface UpdateTeamDTO {
    name?: string;
    abbreviation?: string;
    crest?: string | null;
    president?: string | null;
}