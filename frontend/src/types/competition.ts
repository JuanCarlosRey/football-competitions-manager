import type { Organization } from './organization';
import type { Season } from './season';

/**
 * Represents a competition in the system.
 */
export interface Competition {
  id: number;
  name: string;
  organizationId: number;
  organization?: Organization;
  seasons?: Season[];
}

/**
 * Data Transfer Object for creating a new competition.
 */
export interface CreateCompetitionDTO {
  name: string;
  organizationId: number;
}

/**
 * Data Transfer Object for updating an existing competition.
 */
export interface UpdateCompetitionDTO {
  name?: string;
  organizationId?: number;
}