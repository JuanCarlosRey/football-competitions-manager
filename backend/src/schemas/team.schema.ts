import { z } from 'zod';

/**
 * Schema for creating a new team.
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
    stadiumId: z
        .number({
            error: () => 'The "stadiumId" field must be a number',
        })
        .int('The "stadiumId" field must be an integer')
        .positive('The "stadiumId" field must be a positive integer')
        .nullable()
        .optional(),
});

/**
 * Schema for updating an existing team.
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
    stadiumId: z
        .number({
            error: () => 'The "stadiumId" field must be a number',
        })
        .int('The "stadiumId" field must be an integer')
        .positive('The "stadiumId" field must be a positive integer')
        .nullable()
        .optional(),
});

export type CreateTeamDTO = z.infer<typeof createTeamSchema>;
export type UpdateTeamDTO = z.infer<typeof updateTeamSchema>;