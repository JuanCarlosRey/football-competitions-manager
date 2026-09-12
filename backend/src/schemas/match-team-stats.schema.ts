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
 * Schema for route parameters:
 * - id: match ID from path /api/matches/:id/stats
 * - statId: record ID from path /api/matches/:id/stats/:statId
 */
export const matchTeamStatsParamsSchema = z.object({
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
 * Schema for creating match team stats
 */
export const createMatchTeamStatsSchema = z
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
        possession: nonNegativeInt('possession').max(
            100,
            'The "possession" field cannot exceed 100'
        ),
        shots: nonNegativeInt('shots'),
        shotsOnTarget: nonNegativeInt('shotsOnTarget'),
        fouls: nonNegativeInt('fouls'),
        offsides: nonNegativeInt('offsides'),
        corners: nonNegativeInt('corners'),
        freeKicks: nonNegativeInt('freeKicks'),
        passes: nonNegativeInt('passes'),
        completedPasses: nonNegativeInt('completedPasses'),
        crosses: nonNegativeInt('crosses'),
        interceptions: nonNegativeInt('interceptions'),
        tackles: nonNegativeInt('tackles'),
        saves: nonNegativeInt('saves'),
        yellowCards: nonNegativeInt('yellowCards'),
        redCards: nonNegativeInt('redCards'),
    })
    .superRefine((data, ctx) => {
        if (data.shotsOnTarget > data.shots) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `The "shotsOnTarget" (${data.shotsOnTarget}) cannot be greater than "shots" (${data.shots})`,
                path: ['shotsOnTarget'],
            });
        }
        if (data.completedPasses > data.passes) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `The "completedPasses" (${data.completedPasses}) cannot be greater than "passes" (${data.passes})`,
                path: ['completedPasses'],
            });
        }
    });

/**
 * Helper function to validate if a team belongs to a match (for controller / service usage)
 */
export const validateTeamBelongsToMatch = (
    teamId: number,
    match: { homeTeamId: number; awayTeamId: number }
): boolean => {
    return teamId === match.homeTeamId || teamId === match.awayTeamId;
};

export type MatchTeamStatsParamsDTO = z.infer<typeof matchTeamStatsParamsSchema>;
export type CreateMatchTeamStatsDTO = z.infer<typeof createMatchTeamStatsSchema>;