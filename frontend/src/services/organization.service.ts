import { apiClient } from '../api/axios';
import type {
    Organization,
    CreateOrganizationDTO,
    UpdateOrganizationDTO
} from '../types/organization';

export const organizationService = {
    async getAll(): Promise<Organization[]> {
        const response = await apiClient.get<Organization[]>('/organizations');
        return response.data;
    },

    async getById(id: number): Promise<Organization> {
        const response = await apiClient.get<Organization>(`/organizations/${id}`);
        return response.data;
    },

    async create(data: CreateOrganizationDTO): Promise<Organization> {
        const response = await apiClient.post<Organization>('/organizations', data);
        return response.data;
    },

    async update(id: number, data: UpdateOrganizationDTO): Promise<Organization> {
        const response = await apiClient.put<Organization>(`/organizations/${id}`, data);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/organizations/${id}`);
    },
};