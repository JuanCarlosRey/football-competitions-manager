import { z } from 'zod';

export const createOrganizationSchema = z.object({
    name: z.string({
        error: (issue) => issue.input === undefined
            ? 'The "name" field is required'
            : 'The "name" field must be a string',
    }).min(1, 'The name cannot be empty'),
});

export const updateOrganizationSchema = createOrganizationSchema.partial();

export type CreateOrganizationDTO = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationDTO = z.infer<typeof updateOrganizationSchema>;