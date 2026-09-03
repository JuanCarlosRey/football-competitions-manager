import { z } from 'zod';

/**
 * Schema for creating a new team. This schema validates the required fields for creating a team, including name and abbreviation. It also validates optional fields such as crest and president, ensuring that if provided, they adhere to the expected types and formats.
 */
export const createTeamSchema = z.object({
    name: z
        .string({
            error: (issue) =>
                issue.input === undefined
                    ? 'The "name" field is required'
                    : 'The "name" field must be a string',
        })
        .min(1, 'The "name" field cannot be empty'),
    abbreviation: z
        .string({
            error: (issue) =>
                issue.input === undefined
                    ? 'The "abbreviation" field is required'
                    : 'The "abbreviation" field must be a string',
        })
        .min(1, 'The "abbreviation" field cannot be empty'),
    crest: z
        .string({
            error: () => 'The "crest" field must be a string',
        })
        .url('The "crest" field must be a valid URL')
        .nullable()
        .optional(),
    president: z
        .string({
            error: () => 'The "president" field must be a string',
        })
        .nullable()
        .optional(),
});

/**
 * Schema for updating an existing team. This schema validates the optional fields for updating a team, including name, abbreviation, crest, and president. It ensures that if provided, the fields adhere to the expected types and formats.
 */
export const updateTeamSchema = z.object({
    name: z
        .string({
            error: () => 'The "name" field must be a string',
        })
        .min(1, 'The "name" field cannot be empty')
        .optional(),
    abbreviation: z
        .string({
            error: () => 'The "abbreviation" field must be a string',
        })
        .min(1, 'The "abbreviation" field cannot be empty')
        .optional(),
    crest: z
        .string({
            error: () => 'The "crest" field must be a string',
        })
        .url('The "crest" field must be a valid URL')
        .nullable()
        .optional(),
    president: z
        .string({
            error: () => 'The "president" field must be a string',
        })
        .nullable()
        .optional(),
});

/**
 * TypeScript types inferred from the Zod schemas for creating and updating teams. These types can be used for type-checking in the application to ensure that the data conforms to the expected structure defined by the schemas.
 */
export type CreateTeamDTO = z.infer<typeof createTeamSchema>;

/**
 * TypeScript type inferred from the Zod schema for updating teams. This type can be used for type-checking in the application to ensure that the data conforms to the expected structure defined by the update schema.
 */
export type UpdateTeamDTO = z.infer<typeof updateTeamSchema>;