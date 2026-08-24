import { apiFetch } from "./api";
import type { Competition } from "../types/competition";

export function getCompetitions() {
  return apiFetch<Competition[]>("/competitions");
}