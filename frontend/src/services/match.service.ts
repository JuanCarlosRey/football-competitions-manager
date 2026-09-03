import { apiClient } from '../api/axios';
import type {
    Match,
    CreateMatchDTO,
    UpdateMatchDTO
} from '../types/match';

/**
 * Service for managing matches. This service provides methods to interact with the backend API for performing CRUD operations on matches, including retrieving all matches, getting a match by ID, creating a new match, updating an existing match, and deleting a match.
 */
export const matchService = {

    /**
     * Retrieves all matches from the backend API.
     * 
     * @returns A promise resolving to an array of Match objects.
     */
    async getAll(): Promise<Match[]> {
        const response = await apiClient.get<Match[]>('/matches');
        return response.data;
    },

    /**
     * Retrieves a match by its ID from the backend API.
     * 
     * @param id The ID of the match to retrieve.
     * @returns A promise resolving to the Match object.
     */
    async getById(id: number): Promise<Match> {
        const response = await apiClient.get<Match>(`/matches/${id}`);
        return response.data;
    },

    /**
     * Creates a new match in the backend API.
     * 
     * @param data The data for the new match.
     * @returns A promise resolving to the created Match object.
     */
    async create(data: CreateMatchDTO): Promise<Match> {
        const response = await apiClient.post<Match>('/matches', data);
        return response.data;
    },

    /**
     * Updates an existing match in the backend API.
     * 
     * @param id The ID of the match to update.
     * @param data The updated data for the match.
     * @returns A promise resolving to the updated Match object.
     */
    async update(id: number, data: UpdateMatchDTO): Promise<Match> {
        const response = await apiClient.put<Match>(`/matches/${id}`, data);
        return response.data;
    },

    /**
     * Deletes a match from the backend API.
     * 
     * @param id The ID of the match to delete.
     */
    async delete(id: number): Promise<void> {
        await apiClient.delete(`/matches/${id}`);
    },
};