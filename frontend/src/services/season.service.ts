import { apiClient } from '../api/axios';
import type {
    Season,
    CreateSeasonDTO,
    UpdateSeasonDTO
} from '../types/season';

export const seasonService = {
    async getAll(): Promise<Season[]> {
        const response = await apiClient.get<Season[]>('/seasons');
        return response.data;
    },

    async getById(id: number): Promise<Season> {
        const response = await apiClient.get<Season>(`/seasons/${id}`);
        return response.data;
    },

    async create(data: CreateSeasonDTO): Promise<Season> {
        const response = await apiClient.post<Season>('/seasons', data);
        return response.data;
    },

    async update(id: number, data: UpdateSeasonDTO): Promise<Season> {
        const response = await apiClient.put<Season>(`/seasons/${id}`, data);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/seasons/${id}`);
    },
};