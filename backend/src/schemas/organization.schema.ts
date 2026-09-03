import { z } from 'zod';

/**
 * Schema for creating a new organization. This schema validates that the "name" field is a non-empty string and is required for creating an organization.
 */
export const createOrganizationSchema = z.object({
    name: z.string({
        error: (issue) => issue.input === undefined
            ? 'The "name" field is required'
            : 'The "name" field must be a string',
    }).min(1, 'The name cannot be empty'),
});

/**
 * Schema for updating an existing organization. This schema allows partial updates to the organization's fields.
 */
export const updateOrganizationSchema = createOrganizationSchema.partial();

/**
 * TypeScript types inferred from the Zod schemas for creating and updating organizations. These types can be used for type-checking in the application to ensure that the data conforms to the expected structure defined by the schemas.
 */
export type CreateOrganizationDTO = z.infer<typeof createOrganizationSchema>;

/**
 * TypeScript type inferred from the Zod schema for updating organizations. This type can be used for type-checking in the application to ensure that the data conforms to the expected structure defined by the update schema.
 */
export type UpdateOrganizationDTO = z.infer<typeof updateOrganizationSchema>;