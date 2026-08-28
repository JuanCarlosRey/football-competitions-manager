import { z } from 'zod';

export const createCompetitionSchema = z.object({
    name: z.string({
        error: (issue) => issue.input === undefined
            ? 'The "name" field is required'
            : 'The "name" field must be a string',
    }).min(1, 'The name cannot be empty'),

    organizationId: z.number({
        error: (issue) => issue.input === undefined
            ? 'The "organizationId" field is required'
            : 'The "organizationId" field must be a number',
    }).int('The "organizationId" must be an integer').positive('The "organizationId" must be positive'),
});

export const updateCompetitionSchema = createCompetitionSchema.partial();

export type CreateCompetitionDTO = z.infer<typeof createCompetitionSchema>;
export type UpdateCompetitionDTO = z.infer<typeof updateCompetitionSchema>;