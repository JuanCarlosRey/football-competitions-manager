import { apiClient } from '../api/axios';
import type {
    Stadium,
    CreateStadiumDTO,
    UpdateStadiumDTO
} from '../types/stadium';

export const stadiumService = {
    async getAll(): Promise<Stadium[]> {
        const response = await apiClient.get<Stadium[]>('/stadiums');
        return response.data;
    },

    async getById(id: number): Promise<Stadium> {
        const response = await apiClient.get<Stadium>(`/stadiums/${id}`);
        return response.data;
    },

    async create(data: CreateStadiumDTO): Promise<Stadium> {
        const response = await apiClient.post<Stadium>('/stadiums', data);
        return response.data;
    },

    async update(id: number, data: UpdateStadiumDTO): Promise<Stadium> {
        const response = await apiClient.put<Stadium>(`/stadiums/${id}`, data);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/stadiums/${id}`);
    },
};