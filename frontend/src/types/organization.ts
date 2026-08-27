import type { Competition } from './competition';

export interface Organization {
    id: number;
    name: string;
    competitions?: Competition[];
}

export interface CreateOrganizationDTO {
    name: string;
}

export interface UpdateOrganizationDTO {
    name?: string;
}