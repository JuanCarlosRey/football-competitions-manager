import { z } from 'zod';

/**
 * Schema for creating a new competition.
 */
export const createCompetitionSchema = z.object({
    name: z.string({
        error: (issue) => issue.input === undefined
            ? 'The "name" field is required'
            : 'The "name" field must be a string',
    }).min(1, 'The name cannot be empty'),
    organizationId: z.number({
        error: (issue) => issue.input === undefined
            ? 'The "organizationId" field is required'
            : 'The "organizationId" field must be a number',
    }).int('The "organizationId" must be an integer').positive('The "organizationId" must be positive'),
});

/**
 * Schema for updating an existing competition. All fields are optional, but if provided, they must adhere to the same validation rules as the creation schema.
 */
export const updateCompetitionSchema = createCompetitionSchema.partial();

/**
 * TypeScript types inferred from the Zod schemas for creating and updating competitions. These types can be used for type-checking in the application to ensure that the data conforms to the expected structure defined by the schemas.
 */
export type CreateCompetitionDTO = z.infer<typeof createCompetitionSchema>;

/**
 * TypeScript type inferred from the Zod schema for updating competitions. This type can be used for type-checking in the application to ensure that the data conforms to the expected structure defined by the update schema.
 */
export type UpdateCompetitionDTO = z.infer<typeof updateCompetitionSchema>;