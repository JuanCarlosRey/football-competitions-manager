import { apiClient } from '../api/axios';
import type {
    Team,
    CreateTeamDTO,
    UpdateTeamDTO
} from '../types/team';

export const teamService = {
    async getAll(): Promise<Team[]> {
        const response = await apiClient.get<Team[]>('/teams');
        return response.data;
    },

    async getById(id: number): Promise<Team> {
        const response = await apiClient.get<Team>(`/teams/${id}`);
        return response.data;
    },

    async create(data: CreateTeamDTO): Promise<Team> {
        const response = await apiClient.post<Team>('/teams', data);
        return response.data;
    },

    async update(id: number, data: UpdateTeamDTO): Promise<Team> {
        const response = await apiClient.put<Team>(`/teams/${id}`, data);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/teams/${id}`);
    },
};