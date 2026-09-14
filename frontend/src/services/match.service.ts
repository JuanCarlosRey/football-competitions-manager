import { apiClient } from '../api/axios';
import type {
    Match,
    CreateMatchDTO,
    UpdateMatchDTO
} from '../types/match';
import type {
    MatchLineup,
    AddTeamLineupDTO,
    UpdateLineupEntryDTO
} from '../types/match-lineup';
import type {
    MatchTeamStats,
    CreateMatchTeamStatsDTO,
    UpdateMatchTeamStatsDTO
} from '../types/match-team-stats';

/**
 * Service for managing matches, match lineups, and match team statistics.
 * Provides methods to interact with the backend API for CRUD operations on matches,
 * as well as managing lineups and team statistics for specific matches.
 */
export const matchService = {

    /**
     * Retrieves all matches from the backend API.
     */
    async getAll(): Promise<Match[]> {
        const response = await apiClient.get<Match[]>('/matches');
        return response.data;
    },

    /**
     * Retrieves a match by its ID from the backend API.
     */
    async getById(id: number): Promise<Match> {
        const response = await apiClient.get<Match>(`/matches/${id}`);
        return response.data;
    },

    /**
     * Creates a new match in the backend API.
     */
    async create(data: CreateMatchDTO): Promise<Match> {
        const response = await apiClient.post<Match>('/matches', data);
        return response.data;
    },

    /**
     * Updates an existing match in the backend API.
     */
    async update(id: number, data: UpdateMatchDTO): Promise<Match> {
        const response = await apiClient.put<Match>(`/matches/${id}`, data);
        return response.data;
    },

    /**
     * Deletes a match from the backend API.
     */
    async delete(id: number): Promise<void> {
        await apiClient.delete(`/matches/${id}`);
    },

    /**
     * Retrieves all lineup entries for a specific match.
     * 
     * @param matchId The ID of the match.
     * @returns A promise resolving to an array of MatchLineup objects.
     */
    async getLineups(matchId: number): Promise<MatchLineup[]> {
        const response = await apiClient.get<MatchLineup[]>(`/matches/${matchId}/lineups`);
        return response.data;
    },

    /**
     * Adds a team lineup to a match.
     * 
     * @param matchId The ID of the match.
     * @param data The lineup payload containing teamId and player entries.
     * @returns A promise resolving to the created MatchLineup objects.
     */
    async addTeamLineup(matchId: number, data: AddTeamLineupDTO): Promise<MatchLineup[]> {
        const response = await apiClient.post<MatchLineup[]>(`/matches/${matchId}/lineups`, data);
        return response.data;
    },

    /**
     * Updates an individual lineup entry for a match player.
     * 
     * @param matchId The ID of the match.
     * @param lineupId The ID of the specific lineup entry to update.
     * @param data Partial player lineup properties (starter, shirtNumber, position).
     * @returns A promise resolving to the updated MatchLineup object.
     */
    async updateLineupEntry(
        matchId: number,
        lineupId: number,
        data: UpdateLineupEntryDTO
    ): Promise<MatchLineup> {
        const response = await apiClient.put<MatchLineup>(
            `/matches/${matchId}/lineups/${lineupId}`,
            data
        );
        return response.data;
    },

    /**
     * Removes an individual player from a match lineup.
     * 
     * @param matchId The ID of the match.
     * @param lineupId The ID of the lineup entry to delete.
     */
    async removeLineupEntry(matchId: number, lineupId: number): Promise<void> {
        await apiClient.delete(`/matches/${matchId}/lineups/${lineupId}`);
    },

    /**
     * Retrieves team statistics for a specific match.
     * 
     * @param matchId The ID of the match.
     * @returns A promise resolving to an array of MatchTeamStats objects.
     */
    async getStats(matchId: number): Promise<MatchTeamStats[]> {
        const response = await apiClient.get<MatchTeamStats[]>(`/matches/${matchId}/statistics`);
        return response.data;
    },

    /**
     * Adds team statistics to a match.
     * 
     * @param matchId The ID of the match.
     * @param data The team statistics payload.
     * @returns A promise resolving to the created MatchTeamStats object.
     */
    async addTeamStats(matchId: number, data: CreateMatchTeamStatsDTO): Promise<MatchTeamStats> {
        const response = await apiClient.post<MatchTeamStats>(`/matches/${matchId}/statistics`, data);
        return response.data;
    },

    /**
     * Updates team statistics entry for a match.
     * 
     * @param matchId The ID of the match.
     * @param statId The ID of the statistics entry to update.
     * @param data Partial team statistics properties.
     * @returns A promise resolving to the updated MatchTeamStats object.
     */
    async updateTeamStats(
        matchId: number,
        statId: number,
        data: UpdateMatchTeamStatsDTO
    ): Promise<MatchTeamStats> {
        const response = await apiClient.put<MatchTeamStats>(
            `/matches/${matchId}/statistics/${statId}`,
            data
        );
        return response.data;
    },

    /**
     * Removes team statistics entry from a match.
     * 
     * @param matchId The ID of the match.
     * @param statId The ID of the statistics entry to delete.
     */
    async removeTeamStats(matchId: number, statId: number): Promise<void> {
        await apiClient.delete(`/matches/${matchId}/statistics/${statId}`);
    },
};