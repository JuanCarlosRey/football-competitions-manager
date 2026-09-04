import { apiClient } from '../api/axios';
import type {
    Player,
    CreatePlayerDTO,
    UpdatePlayerDTO
} from '../types/player';

/**
 * Service for managing players. This service provides methods to interact with the backend API for performing CRUD operations on players, including retrieving all players, getting a player by ID, creating a new player, updating an existing player, and deleting a player.
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
};