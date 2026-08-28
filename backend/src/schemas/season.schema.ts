import { z } from 'zod';

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

export type CreateSeasonDTO = z.infer<typeof createSeasonSchema>;
export type UpdateSeasonDTO = z.infer<typeof updateSeasonSchema>;