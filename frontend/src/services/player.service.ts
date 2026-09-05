import { apiClient } from '../api/axios';
import type {
    Player,
    CreatePlayerDTO,
    UpdatePlayerDTO,
    PlayerCareerItem,
    TeamPlayerRelation,
    AddPlayerToTeamDTO,
    UpdatePlayerTeamDatesDTO,
} from '../types/player';

/**
 * Service for managing players and their team assignments.
 * Provides methods to perform CRUD operations on players, retrieve career histories,
 * and manage relationships between players and teams.
 */
export const playerService = {

    /**
     * Retrieves all players from the backend API.
     * 
     * @returns A promise resolving to an array of Player objects.
     */
    async getAll(): Promise<Player[]> {
        const response = await apiClient.get<Player[]>('/players');
        return response.data;
    },

    /**
     * Retrieves a player by its ID from the backend API.
     * 
     * @param id The ID of the player to retrieve.
     * @returns A promise resolving to the Player object.
     */
    async getById(id: number): Promise<Player> {
        const response = await apiClient.get<Player>(`/players/${id}`);
        return response.data;
    },

    /**
     * Creates a new player in the backend API.
     * 
     * @param data The data for the new player.
     * @returns A promise resolving to the created Player object.
     */
    async create(data: CreatePlayerDTO): Promise<Player> {
        const response = await apiClient.post<Player>('/players', data);
        return response.data;
    },

    /**
     * Updates an existing player in the backend API.
     * 
     * @param id The ID of the player to update.
     * @param data The updated data for the player.
     * @returns A promise resolving to the updated Player object.
     */
    async update(id: number, data: UpdatePlayerDTO): Promise<Player> {
        const response = await apiClient.put<Player>(`/players/${id}`, data);
        return response.data;
    },

    /**
     * Deletes a player from the backend API.
     * 
     * @param id The ID of the player to delete.
     */
    async delete(id: number): Promise<void> {
        await apiClient.delete(`/players/${id}`);
    },

    /**
     * Retrieves the career history for a specific player.
     * 
     * @param id The ID of the player.
     * @returns A promise resolving to an array of PlayerCareerItem objects.
     */
    async getCareer(id: number): Promise<PlayerCareerItem[]> {
        const response = await apiClient.get<PlayerCareerItem[]>(`/players/${id}/career`);
        return response.data;
    },

    /**
     * Retrieves all players assigned to a specific team.
     * 
     * @param teamId The ID of the team.
     * @returns A promise resolving to an array of TeamPlayerRelation objects.
     */
    async getPlayersByTeam(teamId: number): Promise<TeamPlayerRelation[]> {
        const response = await apiClient.get<TeamPlayerRelation[]>(`/teams/${teamId}/players`);
        return response.data;
    },

    /**
     * Assigns a player to a specific team.
     * 
     * @param teamId The ID of the team.
     * @param data The payload containing playerId and startDate.
     * @returns A promise resolving to the created TeamPlayerRelation object.
     */
    async addToTeam(teamId: number, data: AddPlayerToTeamDTO): Promise<TeamPlayerRelation> {
        const response = await apiClient.post<TeamPlayerRelation>(`/teams/${teamId}/players`, data);
        return response.data;
    },

    /**
     * Updates contract dates for a player within a team.
     * 
     * @param teamId The ID of the team.
     * @param playerId The ID of the player.
     * @param data The payload containing updated dates (e.g. endDate).
     * @returns A promise resolving to the updated TeamPlayerRelation object.
     */
    async updateTeamContract(
        teamId: number,
        playerId: number,
        data: UpdatePlayerTeamDatesDTO
    ): Promise<TeamPlayerRelation> {
        const response = await apiClient.put<TeamPlayerRelation>(`/teams/${teamId}/players/${playerId}`, data);
        return response.data;
    },

    /**
     * Removes a player from a team contract.
     * 
     * @param teamId The ID of the team.
     * @param playerId The ID of the player to remove.
     */
    async removeFromTeam(teamId: number, playerId: number): Promise<void> {
        await apiClient.delete(`/teams/${teamId}/players/${playerId}`);
    },
};