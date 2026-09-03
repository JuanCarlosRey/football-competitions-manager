import { apiClient } from '../api/axios';
import type {
    Organization,
    CreateOrganizationDTO,
    UpdateOrganizationDTO
} from '../types/organization';

/**
 * Service for managing organizations. This service provides methods to interact with the backend API for performing CRUD operations on organizations, including retrieving all organizations, getting an organization by ID, creating a new organization, updating an existing organization, and deleting an organization.
 */
export const organizationService = {

    /**
     * Retrieves all organizations from the backend API.
     * 
     * @returns A promise resolving to an array of Organization objects.
     */
    async getAll(): Promise<Organization[]> {
        const response = await apiClient.get<Organization[]>('/organizations');
        return response.data;
    },

    /**
     * Retrieves an organization by its ID from the backend API.
     * 
     * @param id The ID of the organization to retrieve.
     * @returns A promise resolving to the Organization object.
     */
    async getById(id: number): Promise<Organization> {
        const response = await apiClient.get<Organization>(`/organizations/${id}`);
        return response.data;
    },

    /**
     * Creates a new organization in the backend API.
     * 
     * @param data The data for the new organization.
     * @returns A promise resolving to the created Organization object.
     */
    async create(data: CreateOrganizationDTO): Promise<Organization> {
        const response = await apiClient.post<Organization>('/organizations', data);
        return response.data;
    },

    /**
     * Updates an existing organization in the backend API.
     * 
     * @param id The ID of the organization to update.
     * @param data The updated data for the organization.
     * @returns A promise resolving to the updated Organization object.
     */
    async update(id: number, data: UpdateOrganizationDTO): Promise<Organization> {
        const response = await apiClient.put<Organization>(`/organizations/${id}`, data);
        return response.data;
    },

    /**
     * Deletes an organization from the backend API.
     * 
     * @param id The ID of the organization to delete.
     */
    async delete(id: number): Promise<void> {
        await apiClient.delete(`/organizations/${id}`);
    },
};