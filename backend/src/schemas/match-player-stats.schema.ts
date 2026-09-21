import { z } from 'zod';

/**
 * Validaciones genéricas para números enteros no negativos (>= 0)
 */
const nonNegativeInt = (fieldName: string) =>
    z
        .number({
            error: (issue) =>
                issue.input === undefined
                    ? `The "${fieldName}" field is required`
                    : `The "${fieldName}" field must be a number`,
        })
        .int(`The "${fieldName}" field must be an integer`)
        .min(0, `The "${fieldName}" field must be greater than or equal to 0`);

/**
 * Validaciones genéricas para el campo rating (0.0 a 10.0)
 */
const ratingSchema = z
    .number({
        error: () => 'The "rating" field must be a number',
    })
    .min(0, 'The "rating" field must be greater than or equal to 0')
    .max(10, 'The "rating" field cannot exceed 10');

/**
 * Schema for route parameters:
 * - id: match ID from path /api/matches/:id/player-stats
 * - statId: record ID from path /api/matches/:id/player-stats/:statId
 */
export const matchPlayerStatsParamsSchema = z.object({
    id: z.coerce
        .number({
            error: (issue) =>
                issue.input === undefined
                    ? 'The "id" parameter is required'
                    : 'The "id" parameter must be a number',
        })
        .int('The "id" parameter must be an integer')
        .positive('The "id" parameter must be a positive integer'),
    statId: z.coerce
        .number({
            error: () => 'The "statId" parameter must be a number',
        })
        .int('The "statId" parameter must be an integer')
        .positive('The "statId" parameter must be a positive integer')
        .optional(),
});

/**
 * Schema for creating match player stats
 */
export const createMatchPlayerStatsSchema = z
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
        goals: nonNegativeInt('goals'),
        goalsConceded: nonNegativeInt('goalsConceded'),
        assists: nonNegativeInt('assists'),
        yellowCards: nonNegativeInt('yellowCards').max(
            2,
            'The "yellowCards" field cannot exceed 2'
        ),
        redCards: nonNegativeInt('redCards').max(
            1,
            'The "redCards" field cannot exceed 1'
        ),
        rating: ratingSchema.optional().nullable(),
    })
    .superRefine((data, ctx) => {
        if (data.yellowCards === 2 && data.redCards === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'A player with 2 yellow cards must have 1 red card (expulsion)',
                path: ['redCards'],
            });
        }
    });

/**
 * Schema for updating match player stats
 */
export const updateMatchPlayerStatsSchema = z
    .object({
        goals: nonNegativeInt('goals').optional(),
        goalsConceded: nonNegativeInt('goalsConceded').optional(),
        assists: nonNegativeInt('assists').optional(),
        yellowCards: nonNegativeInt('yellowCards')
            .max(2, 'The "yellowCards" field cannot exceed 2')
            .optional(),
        redCards: nonNegativeInt('redCards')
            .max(1, 'The "redCards" field cannot exceed 1')
            .optional(),
        rating: ratingSchema.optional().nullable(),
    })
    .superRefine((data, ctx) => {
        if (
            data.yellowCards !== undefined &&
            data.redCards !== undefined &&
            data.yellowCards === 2 &&
            data.redCards === 0
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'A player with 2 yellow cards must have 1 red card (expulsion)',
                path: ['redCards'],
            });
        }
    });

/**
 * Helper function to validate if a player is registered in the lineup of a match
 */
export const validatePlayerBelongsToMatch = (
    playerId: number,
    lineup: Array<{ playerId: number }>
): boolean => {
    return lineup.some((entry) => entry.playerId === playerId);
};

export type MatchPlayerStatsParamsDTO = z.infer<typeof matchPlayerStatsParamsSchema>;
export type CreateMatchPlayerStatsDTO = z.infer<typeof createMatchPlayerStatsSchema>;
export type UpdateMatchPlayerStatsDTO = z.infer<typeof updateMatchPlayerStatsSchema>;