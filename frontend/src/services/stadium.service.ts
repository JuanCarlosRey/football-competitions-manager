import { apiClient } from '../api/axios';
import type {
    Stadium,
    CreateStadiumDTO,
    UpdateStadiumDTO
} from '../types/stadium';

/**
 * Service for managing stadiums. This service provides methods to interact with the backend API for performing CRUD operations on stadiums, including retrieving all stadiums, getting a stadium by ID, creating a new stadium, updating an existing stadium, and deleting a stadium.
 */
export const stadiumService = {

    /**
     * Retrieves all stadiums from the backend API.
     * 
     * @returns A promise resolving to an array of Stadium objects.
     */
    async getAll(): Promise<Stadium[]> {
        const response = await apiClient.get<Stadium[]>('/stadiums');
        return response.data;
    },

    /**
     * Retrieves a stadium by its ID from the backend API.
     * 
     * @param id The ID of the stadium to retrieve.
     * @returns A promise resolving to the Stadium object.
     */
    async getById(id: number): Promise<Stadium> {
        const response = await apiClient.get<Stadium>(`/stadiums/${id}`);
        return response.data;
    },

    /**
     * Creates a new stadium in the backend API.
     * 
     * @param data The data for the new stadium.
     * @returns A promise resolving to the created Stadium object.
     */
    async create(data: CreateStadiumDTO): Promise<Stadium> {
        const response = await apiClient.post<Stadium>('/stadiums', data);
        return response.data;
    },

    /**
     * Updates an existing stadium in the backend API.
     * 
     * @param id The ID of the stadium to update.
     * @param data The updated data for the stadium.
     * @returns A promise resolving to the updated Stadium object.
     */
    async update(id: number, data: UpdateStadiumDTO): Promise<Stadium> {
        const response = await apiClient.put<Stadium>(`/stadiums/${id}`, data);
        return response.data;
    },

    /**
     * Deletes a stadium from the backend API.
     * 
     * @param id The ID of the stadium to delete.
     */
    async delete(id: number): Promise<void> {
        await apiClient.delete(`/stadiums/${id}`);
    },
};