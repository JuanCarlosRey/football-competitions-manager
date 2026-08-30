import { z } from 'zod';

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

export type CreateStadiumDTO = z.infer<typeof createStadiumSchema>;
export type UpdateStadiumDTO = z.infer<typeof updateStadiumSchema>;