import { z } from 'zod';

/**
 * Schema for route parameters containing teamId and optionally playerId.
 * Validates that path parameters are positive integers.
 */
export const teamPlayerParamsSchema = z.object({
    id: z.coerce
        .number({
            error: (issue) =>
                issue.input === undefined
                    ? 'The "id" parameter is required'
                    : 'The "id" parameter must be a number',
        })
        .int('The "id" parameter must be an integer')
        .positive('The "id" parameter must be a positive integer'),
    playerId: z.coerce
        .number({
            error: () => 'The "playerId" parameter must be a number',
        })
        .int('The "playerId" parameter must be an integer')
        .positive('The "playerId" parameter must be a positive integer')
        .optional(),
});

/**
 * Schema for adding a player to a team (creating a TeamPlayer relation).
 * Validates required fields such as playerId and startDate, ensuring dates are valid ISO strings or Date instances.
 * Also includes a custom refinement to ensure endDate is chronologically after startDate if provided.
 */
export const createTeamPlayerSchema = z
    .object({
        playerId: z
            .number({
                error: (issue) =>
                    issue.input === undefined
                        ? 'The "playerId" field is required'
                        : 'The "playerId" field must be a number',
            })
            .int('The "playerId" field must be an integer')
            .positive('The "playerId" field must be a positive integer'),
        startDate: z.coerce.date({
            error: (issue) =>
                issue.input === undefined
                    ? 'The "startDate" field is required'
                    : 'The "startDate" field must be a valid date',
        }),
        endDate: z.coerce
            .date({
                error: () => 'The "endDate" field must be a valid date',
            })
            .nullable()
            .optional(),
    })
    .refine(
        (data) => {
            if (data.endDate && data.startDate) {
                return data.endDate > data.startDate;
            }
            return true;
        },
        {
            message: 'The "endDate" must be later than the "startDate"',
            path: ['endDate'],
        }
    );

/**
 * Schema for updating an existing TeamPlayer relation (modifying contract dates).
 * Validates optional fields for updating startDate and endDate.
 * Includes a custom refinement to guarantee that endDate is after startDate when both are provided.
 */
export const updateTeamPlayerSchema = z
    .object({
        startDate: z.coerce
            .date({
                error: () => 'The "startDate" field must be a valid date',
            })
            .optional(),
        endDate: z.coerce
            .date({
                error: () => 'The "endDate" field must be a valid date',
            })
            .nullable()
            .optional(),
    })
    .refine(
        (data) => {
            if (data.startDate && data.endDate) {
                return data.endDate > data.startDate;
            }
            return true;
        },
        {
            message: 'The "endDate" must be later than the "startDate"',
            path: ['endDate'],
        }
    );

/**
 * TypeScript type inferred from the Zod schema for route parameters.
 */
export type TeamPlayerParamsDTO = z.infer<typeof teamPlayerParamsSchema>;

/**
 * TypeScript type inferred from the Zod schema for creating a team-player relation.
 */
export type CreateTeamPlayerDTO = z.infer<typeof createTeamPlayerSchema>;

/**
 * TypeScript type inferred from the Zod schema for updating a team-player relation.
 */
export type UpdateTeamPlayerDTO = z.infer<typeof updateTeamPlayerSchema>;