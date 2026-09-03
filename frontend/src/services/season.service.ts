import { apiClient } from '../api/axios';
import type {
    Season,
    CreateSeasonDTO,
    UpdateSeasonDTO
} from '../types/season';

/**
 * Service for managing seasons. This service provides methods to interact with the backend API for performing CRUD operations on seasons, including retrieving all seasons, getting a season by ID, creating a new season, updating an existing season, and deleting a season.
 */
export const seasonService = {

    /**
     * Retrieves all seasons from the backend API.
     * 
     * @returns A promise resolving to an array of Season objects.
     */
    async getAll(): Promise<Season[]> {
        const response = await apiClient.get<Season[]>('/seasons');
        return response.data;
    },

    /**
     * Retrieves a season by its ID from the backend API.
     * 
     * @param id The ID of the season to retrieve.
     * @returns A promise resolving to the Season object.
     */
    async getById(id: number): Promise<Season> {
        const response = await apiClient.get<Season>(`/seasons/${id}`);
        return response.data;
    },

    /**
     * Creates a new season in the backend API.
     * 
     * @param data The data for the new season.
     * @returns A promise resolving to the created Season object.
     */
    async create(data: CreateSeasonDTO): Promise<Season> {
        const response = await apiClient.post<Season>('/seasons', data);
        return response.data;
    },

    /**
     * Updates an existing season in the backend API.
     * 
     * @param id The ID of the season to update.
     * @param data The updated data for the season.
     * @returns A promise resolving to the updated Season object.
     */
    async update(id: number, data: UpdateSeasonDTO): Promise<Season> {
        const response = await apiClient.put<Season>(`/seasons/${id}`, data);
        return response.data;
    },

    /**
     * Deletes a season from the backend API.
     * 
     * @param id The ID of the season to delete.
     */
    async delete(id: number): Promise<void> {
        await apiClient.delete(`/seasons/${id}`);
    },
};