import { apiClient } from '../api/axios';
import type {
    Team,
    CreateTeamDTO,
    UpdateTeamDTO
} from '../types/team';

/**
 * Service for managing teams. This service provides methods to interact with the backend API for performing CRUD operations on teams, including retrieving all teams, getting a team by ID, creating a new team, updating an existing team, and deleting a team.
 */
export const teamService = {

    /**
     * Retrieves all teams from the backend API.
     * 
     * @returns A promise resolving to an array of Team objects.
     */
    async getAll(): Promise<Team[]> {
        const response = await apiClient.get<Team[]>('/teams');
        return response.data;
    },

    /**
     * Retrieves a team by its ID from the backend API.
     * 
     * @param id The ID of the team to retrieve.
     * @returns A promise resolving to the Team object.
     */
    async getById(id: number): Promise<Team> {
        const response = await apiClient.get<Team>(`/teams/${id}`);
        return response.data;
    },

    /**
     * Creates a new team in the backend API.
     * 
     * @param data The data for the new team.
     * @returns A promise resolving to the created Team object.
     */
    async create(data: CreateTeamDTO): Promise<Team> {
        const response = await apiClient.post<Team>('/teams', data);
        return response.data;
    },

    /**
     * Updates an existing team in the backend API.
     * 
     * @param id The ID of the team to update.
     * @param data The updated data for the team.
     * @returns A promise resolving to the updated Team object.
     */
    async update(id: number, data: UpdateTeamDTO): Promise<Team> {
        const response = await apiClient.put<Team>(`/teams/${id}`, data);
        return response.data;
    },

    /**
     * Deletes a team from the backend API.
     * 
     * @param id The ID of the team to delete.
     */
    async delete(id: number): Promise<void> {
        await apiClient.delete(`/teams/${id}`);
    },
};