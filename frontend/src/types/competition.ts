import type { Organization } from './organization';
import type { Season } from './season';

export interface Competition {
  id: number;
  name: string;
  organizationId: number;
  organization?: Organization;
  seasons?: Season[];
}

export interface CreateCompetitionDTO {
  name: string;
  organizationId: number;
}

export interface UpdateCompetitionDTO {
  name?: string;
  organizationId?: number;
}