import type { Competition } from './competition';

/**
 * Represents an organization in the system.
 */
export interface Organization {
    id: number;
    name: string;
    competitions?: Competition[];
}

/**
 * Data Transfer Object for creating a new organization.
 */
export interface CreateOrganizationDTO {
    name: string;
}

/**
 * Data Transfer Object for updating an existing organization.
 */
export interface UpdateOrganizationDTO {
    name?: string;
}