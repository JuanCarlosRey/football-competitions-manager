import { z } from 'zod';

/**
 * Schema for creating a new season. This schema validates the required fields for creating a season, including startDate, endDate, and competitionId. It also ensures that the endDate is after the startDate.
 */
export const createSeasonSchema = z
    .object({
        startDate: z.coerce.date({
            error: (issue) =>
                issue.input === undefined
                    ? 'The "startDate" field is required'
                    : 'The "startDate" field must be a valid date',
        }),
        endDate: z.coerce.date({
            error: (issue) =>
                issue.input === undefined
                    ? 'The "endDate" field is required'
                    : 'The "endDate" field must be a valid date',
        }),
        competitionId: z
            .number({
                error: (issue) =>
                    issue.input === undefined
                        ? 'The "competitionId" field is required'
                        : 'The "competitionId" field must be a number',
            })
            .int('The "competitionId" must be an integer')
            .positive('The "competitionId" must be positive'),
    })
    .refine((data) => data.endDate > data.startDate, {
        message: 'The "endDate" must be after the "startDate"',
        path: ['endDate'],
    });

/**
 * Schema for updating an existing season. This schema validates the optional fields for updating a season, including startDate, endDate, and competitionId. It also ensures that if both startDate and endDate are provided, the endDate is after the startDate.
 */
export const updateSeasonSchema = z
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
            .optional(),
        competitionId: z
            .number({
                error: () => 'The "competitionId" field must be a number',
            })
            .int('The "competitionId" must be an integer')
            .positive('The "competitionId" must be positive')
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
            message: 'The "endDate" must be after the "startDate"',
            path: ['endDate'],
        }
    );

/**
 * TypeScript types inferred from the Zod schemas for creating and updating seasons. These types can be used for type-checking in the application to ensure that the data conforms to the expected structure defined by the schemas.
 */
export type CreateSeasonDTO = z.infer<typeof createSeasonSchema>;

/**
 * TypeScript type inferred from the Zod schema for updating seasons. This type can be used for type-checking in the application to ensure that the data conforms to the expected structure defined by the update schema.
 */
export type UpdateSeasonDTO = z.infer<typeof updateSeasonSchema>;