import { z } from 'zod';

/**
 * Enum for preferred foot options mirroring the database constraints.
 */
export const PreferredFootEnum = z.enum(['LEFT', 'RIGHT', 'BOTH'], {
    error: (issue) =>
        issue.input === undefined
            ? 'The "preferredFoot" field is required'
            : 'The "preferredFoot" field must be "LEFT", "RIGHT", or "BOTH"',
});

/**
 * Schema for creating a new player. This schema validates all required fields for creating a player, 
 * including names, birth date, physical attributes, overall rating, position, nationality, and preferred foot. 
 * Optional fields like marketValue and annualSalary are also validated to meet financial constraints if provided.
 */
export const createPlayerSchema = z.object({
    firstName: z
        .string({
            error: (issue) =>
                issue.input === undefined
                    ? 'The "firstName" field is required'
                    : 'The "firstName" field must be a string',
        })
        .min(1, 'The "firstName" field cannot be empty'),
    lastName: z
        .string({
            error: (issue) =>
                issue.input === undefined
                    ? 'The "lastName" field is required'
                    : 'The "lastName" field must be a string',
        })
        .min(1, 'The "lastName" field cannot be empty'),
    birthDate: z.coerce
        .date({
            error: (issue) =>
                issue.input === undefined
                    ? 'The "birthDate" field is required'
                    : 'The "birthDate" field must be a valid date',
        }),
    position: z
        .string({
            error: (issue) =>
                issue.input === undefined
                    ? 'The "position" field is required'
                    : 'The "position" field must be a string',
        })
        .min(1, 'The "position" field cannot be empty'),
    nationality: z
        .string({
            error: (issue) =>
                issue.input === undefined
                    ? 'The "nationality" field is required'
                    : 'The "nationality" field must be a string',
        })
        .min(1, 'The "nationality" field cannot be empty'),
    overall: z
        .number({
            error: (issue) =>
                issue.input === undefined
                    ? 'The "overall" field is required'
                    : 'The "overall" field must be a number',
        })
        .int('The "overall" field must be an integer')
        .min(40, 'The "overall" field must be at least 40')
        .max(109, 'The "overall" field cannot exceed 109'),
    height: z
        .number({
            error: (issue) =>
                issue.input === undefined
                    ? 'The "height" field is required'
                    : 'The "height" field must be a number',
        })
        .gt(0, 'The "height" field must be greater than 0'),
    weight: z
        .number({
            error: (issue) =>
                issue.input === undefined
                    ? 'The "weight" field is required'
                    : 'The "weight" field must be a number',
        })
        .gt(0, 'The "weight" field must be greater than 0'),
    preferredFoot: PreferredFootEnum,
    marketValue: z
        .number({
            error: () => 'The "marketValue" field must be a number',
        })
        .gte(0, 'The "marketValue" field must be greater than or equal to 0')
        .nullable()
        .optional(),
    annualSalary: z
        .number({
            error: () => 'The "annualSalary" field must be a number',
        })
        .gte(0, 'The "annualSalary" field must be greater than or equal to 0')
        .nullable()
        .optional(),
});

/**
 * Schema for updating an existing player. This schema validates the optional fields for updating a player, 
 * ensuring that if provided, the fields adhere to expected types, bounds, and enum definitions.
 */
export const updatePlayerSchema = z.object({
    firstName: z
        .string({
            error: () => 'The "firstName" field must be a string',
        })
        .min(1, 'The "firstName" field cannot be empty')
        .optional(),
    lastName: z
        .string({
            error: () => 'The "lastName" field must be a string',
        })
        .min(1, 'The "lastName" field cannot be empty')
        .optional(),
    birthDate: z.coerce
        .date({
            error: () => 'The "birthDate" field must be a valid date',
        })
        .optional(),
    position: z
        .string({
            error: () => 'The "position" field must be a string',
        })
        .min(1, 'The "position" field cannot be empty')
        .optional(),
    nationality: z
        .string({
            error: () => 'The "nationality" field must be a string',
        })
        .min(1, 'The "nationality" field cannot be empty')
        .optional(),
    overall: z
        .number({
            error: () => 'The "overall" field must be a number',
        })
        .int('The "overall" field must be an integer')
        .min(40, 'The "overall" field must be at least 40')
        .max(109, 'The "overall" field cannot exceed 109')
        .optional(),
    height: z
        .number({
            error: () => 'The "height" field must be a number',
        })
        .gt(0, 'The "height" field must be greater than 0')
        .optional(),
    weight: z
        .number({
            error: () => 'The "weight" field must be a number',
        })
        .gt(0, 'The "weight" field must be greater than 0')
        .optional(),
    preferredFoot: z
        .enum(['LEFT', 'RIGHT', 'BOTH'], {
            error: () => 'The "preferredFoot" field must be "LEFT", "RIGHT", or "BOTH"',
        })
        .optional(),
    marketValue: z
        .number({
            error: () => 'The "marketValue" field must be a number',
        })
        .gte(0, 'The "marketValue" field must be greater than or equal to 0')
        .nullable()
        .optional(),
    annualSalary: z
        .number({
            error: () => 'The "annualSalary" field must be a number',
        })
        .gte(0, 'The "annualSalary" field must be greater than or equal to 0')
        .nullable()
        .optional(),
});

/**
 * TypeScript type inferred from the Zod schema for creating players.
 */
export type CreatePlayerDTO = z.infer<typeof createPlayerSchema>;

/**
 * TypeScript type inferred from the Zod schema for updating players.
 */
export type UpdatePlayerDTO = z.infer<typeof updatePlayerSchema>;