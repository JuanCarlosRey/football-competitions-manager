import type { Organization } from './organization';

export interface Competition {
  id: number;
  name: string;
  organizationId: number;
  organization?: Organization;
  seasons?: unknown[];
}

export interface CreateCompetitionDTO {
  name: string;
  organizationId: number;
}

export interface UpdateCompetitionDTO {
  name?: string;
  organizationId?: number;
}