import { apiClient } from '../api/axios';
import type {
    Match,
    CreateMatchDTO,
    UpdateMatchDTO
} from '../types/match';

export const matchService = {
    async getAll(): Promise<Match[]> {
        const response = await apiClient.get<Match[]>('/matches');
        return response.data;
    },

    async getById(id: number): Promise<Match> {
        const response = await apiClient.get<Match>(`/matches/${id}`);
        return response.data;
    },

    async create(data: CreateMatchDTO): Promise<Match> {
        const response = await apiClient.post<Match>('/matches', data);
        return response.data;
    },

    async update(id: number, data: UpdateMatchDTO): Promise<Match> {
        const response = await apiClient.put<Match>(`/matches/${id}`, data);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/matches/${id}`);
    },
};