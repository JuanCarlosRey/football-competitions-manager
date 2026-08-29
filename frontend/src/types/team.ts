export interface Team {
    id: number;
    name: string;
    abbreviation: string;
    crest?: string | null;
    president?: string | null;
    homeMatches?: Array<unknown>;
    awayMatches?: Array<unknown>;
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