import { apiClient } from '../api/axios';
import type {
  Competition,
  CreateCompetitionDTO,
  UpdateCompetitionDTO
} from '../types/competition';

/**
 * Service for managing competitions. This service provides methods to interact with the backend API for performing CRUD operations on competitions, including retrieving all competitions, getting a competition by ID, creating a new competition, updating an existing competition, and deleting a competition.  
 */
export const competitionService = {

  /**
   * Retrieves all competitions from the backend API.
   * 
   * @returns A promise resolving to an array of Competition objects.
   */
  async getAll(): Promise<Competition[]> {
    const response = await apiClient.get<Competition[]>('/competitions');
    return response.data;
  },

  /**
   * Retrieves a competition by its ID from the backend API.
   * 
   * @param id The ID of the competition to retrieve.
   * @returns A promise resolving to the Competition object.
   */
  async getById(id: number): Promise<Competition> {
    const response = await apiClient.get<Competition>(`/competitions/${id}`);
    return response.data;
  },

  /**
   * Creates a new competition in the backend API.
   * 
   * @param data The data for the new competition.
   * @returns A promise resolving to the created Competition object.
   */
  async create(data: CreateCompetitionDTO): Promise<Competition> {
    const response = await apiClient.post<Competition>('/competitions', data);
    return response.data;
  },

  /**
   * Updates an existing competition in the backend API.
   * 
   * @param id The ID of the competition to update.
   * @param data The updated data for the competition.
   * @returns A promise resolving to the updated Competition object.
   */
  async update(id: number, data: UpdateCompetitionDTO): Promise<Competition> {
    const response = await apiClient.put<Competition>(`/competitions/${id}`, data);
    return response.data;
  },

  /**
   * Deletes a competition from the backend API.
   * 
   * @param id The ID of the competition to delete.
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/competitions/${id}`);
  },
};