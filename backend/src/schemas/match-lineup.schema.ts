import { z } from 'zod';

/**
 * Schema for route parameters:
 * - id: match ID from path /api/matches/:id/lineups
 * - lineupId: record ID from path /api/matches/:id/lineups/:lineupId
 */
export const matchLineupParamsSchema = z.object({
    id: z.coerce
        .number({
            error: (issue) =>
                issue.input === undefined
                    ? 'The "id" parameter is required'
                    : 'The "id" parameter must be a number',
        })
        .int('The "id" parameter must be an integer')
        .positive('The "id" parameter must be a positive integer'),
    lineupId: z.coerce
        .number({
            error: () => 'The "lineupId" parameter must be a number',
        })
        .int('The "lineupId" parameter must be an integer')
        .positive('The "lineupId" parameter must be a positive integer')
        .optional(),
});

export const matchLineupItemSchema = z.object({
    playerId: z
        .number({
            error: (issue) =>
                issue.input === undefined
                    ? 'The "playerId" field is required'
                    : 'The "playerId" field must be a number',
        })
        .int('The "playerId" field must be an integer')
        .positive('The "playerId" field must be a positive integer'),
    starter: z.boolean({
        error: (issue) =>
            issue.input === undefined
                ? 'The "starter" field is required'
                : 'The "starter" field must be a boolean',
    }),
    shirtNumber: z
        .number({ error: () => 'The "shirtNumber" field must be a number' })
        .int('The "shirtNumber" field must be an integer')
        .min(1, 'The "shirtNumber" must be at least 1')
        .max(99, 'The "shirtNumber" cannot exceed 99')
        .nullable()
        .optional(),
    position: z
        .string({ error: () => 'The "position" field must be a string' })
        .trim()
        .nullable()
        .optional(),
});

export const createMatchLineupSchema = z
    .object({
        teamId: z
            .number({
                error: (issue) =>
                    issue.input === undefined
                        ? 'The "teamId" field is required'
                        : 'The "teamId" field must be a number',
            })
            .int('The "teamId" field must be an integer')
            .positive('The "teamId" field must be a positive integer'),
        players: z
            .array(matchLineupItemSchema, {
                error: (issue) =>
                    issue.input === undefined
                        ? 'The "players" field is required'
                        : 'The "players" field must be an array',
            })
            .min(1, 'The "players" array must contain at least one player'),
    })
    .superRefine((data, ctx) => {
        const playerIds = data.players.map((p) => p.playerId);
        const duplicates = playerIds.filter((id, index) => playerIds.indexOf(id) !== index);

        if (duplicates.length > 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Duplicate players found in lineup payload: [${Array.from(new Set(duplicates)).join(', ')}]`,
                path: ['players'],
            });
        }

        const startersCount = data.players.filter((p) => p.starter).length;
        if (startersCount > 11) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `A team cannot have more than 11 starting players (found ${startersCount})`,
                path: ['players'],
            });
        }
    });

export const updateMatchLineupItemSchema = z.object({
    starter: z.boolean({ error: () => 'The "starter" field must be a boolean' }).optional(),
    shirtNumber: z
        .number({ error: () => 'The "shirtNumber" field must be a number' })
        .int('The "shirtNumber" field must be an integer')
        .min(1, 'The "shirtNumber" must be at least 1')
        .max(99, 'The "shirtNumber" cannot exceed 99')
        .nullable()
        .optional(),
    position: z
        .string({ error: () => 'The "position" field must be a string' })
        .trim()
        .nullable()
        .optional(),
});

export type MatchLineupParamsDTO = z.infer<typeof matchLineupParamsSchema>;
export type CreateMatchLineupDTO = z.infer<typeof createMatchLineupSchema>;
export type UpdateMatchLineupItemDTO = z.infer<typeof updateMatchLineupItemSchema>;