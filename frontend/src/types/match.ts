import type { Team } from './team';
import type { Season } from './season';
import type { Stadium } from './stadium';

export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED';

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

export interface CreateMatchDTO {
    dateTime: string;
    status: MatchStatus;
    seasonId: number;
    stadiumId: number;
    homeTeamId: number;
    awayTeamId: number;
}

export interface UpdateMatchDTO {
    dateTime?: string;
    status?: MatchStatus;
    seasonId?: number;
    stadiumId?: number;
    homeTeamId?: number;
    awayTeamId?: number;
}