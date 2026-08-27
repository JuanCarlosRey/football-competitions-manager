import { apiClient } from '../api/axios';
import type { Competition } from "../types/competition";

export function getCompetitions() {
  return apiClient.get<Competition[]>("/competitions");
}