import { apiClient } from '../api/axios';
import type {
  Competition,
  CreateCompetitionDTO,
  UpdateCompetitionDTO
} from '../types/competition';

export const competitionService = {
  async getAll(): Promise<Competition[]> {
    const response = await apiClient.get<Competition[]>('/competitions');
    return response.data;
  },

  async getById(id: number): Promise<Competition> {
    const response = await apiClient.get<Competition>(`/competitions/${id}`);
    return response.data;
  },

  async create(data: CreateCompetitionDTO): Promise<Competition> {
    const response = await apiClient.post<Competition>('/competitions', data);
    return response.data;
  },

  async update(id: number, data: UpdateCompetitionDTO): Promise<Competition> {
    const response = await apiClient.put<Competition>(`/competitions/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/competitions/${id}`);
  },
};