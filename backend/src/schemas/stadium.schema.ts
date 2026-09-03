import { z } from 'zod';

/**
 * Schema for creating a new stadium. This schema validates the required fields for creating a stadium, including name, capacity, and address. It ensures that the name and address are non-empty strings and that the capacity is a non-negative integer.
 */
export const createStadiumSchema = z.object({
    name: z
        .string({
            error: (issue) =>
                issue.input === undefined
                    ? 'The "name" field is required'
                    : 'The "name" field must be a string',
        })
        .min(1, 'The "name" field cannot be empty'),
    capacity: z
        .number({
            error: (issue) =>
                issue.input === undefined
                    ? 'The "capacity" field is required'
                    : 'The "capacity" field must be a number',
        })
        .int('The "capacity" field must be an integer')
        .nonnegative('The "capacity" field cannot be a negative value'),
    address: z
        .string({
            error: (issue) =>
                issue.input === undefined
                    ? 'The "address" field is required'
                    : 'The "address" field must be a string',
        })
        .min(1, 'The "address" field cannot be empty'),
});

/**
 * Schema for updating an existing stadium. This schema validates the optional fields for updating a stadium, including name, capacity, and address. It ensures that if provided, the name and address are non-empty strings and that the capacity is a non-negative integer.
 */
export const updateStadiumSchema = z.object({
    name: z
        .string({
            error: () => 'The "name" field must be a string',
        })
        .min(1, 'The "name" field cannot be empty')
        .optional(),
    capacity: z
        .number({
            error: () => 'The "capacity" field must be a number',
        })
        .int('The "capacity" field must be an integer')
        .nonnegative('The "capacity" field cannot be a negative value')
        .optional(),
    address: z
        .string({
            error: () => 'The "address" field must be a string',
        })
        .min(1, 'The "address" field cannot be empty')
        .optional(),
});

/**
 * TypeScript types inferred from the Zod schemas for creating and updating stadiums. These types can be used for type-checking in the application to ensure that the data conforms to the expected structure defined by the schemas.
 */
export type CreateStadiumDTO = z.infer<typeof createStadiumSchema>;

/**
 * TypeScript type inferred from the Zod schema for updating stadiums. This type can be used for type-checking in the application to ensure that the data conforms to the expected structure defined by the update schema.
 */
export type UpdateStadiumDTO = z.infer<typeof updateStadiumSchema>;