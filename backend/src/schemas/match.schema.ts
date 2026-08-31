import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

export const MatchStatusEnum = z.enum(['SCHEDULED', 'LIVE', 'FINISHED'], {
    error: (issue) =>
        issue.input === undefined
            ? 'The "status" field is required'
            : 'The "status" field must be a valid MatchStatus',
});

const idSchema = (fieldName: string) =>
    z
        .number({
            error: (issue) =>
                issue.input === undefined
                    ? `The "${fieldName}" field is required`
                    : `The "${fieldName}" field must be an integer`,
        })
        .int(`The "${fieldName}" field must be an integer`)
        .positive(`The "${fieldName}" field must be a positive integer`);

const optionalIdSchema = (fieldName: string) =>
    z
        .number({
            error: () => `The "${fieldName}" field must be an integer`,
        })
        .int(`The "${fieldName}" field must be an integer`)
        .positive(`The "${fieldName}" field must be a positive integer`)
        .optional();

export const createMatchSchema = z
    .object({
        dateTime: z
            .string({
                error: (issue) =>
                    issue.input === undefined
                        ? 'The "dateTime" field is required'
                        : 'The "dateTime" field must be a valid ISO date string',
            })
            .datetime({ message: 'The "dateTime" field must be a valid ISO 8601 date string' }),
        status: MatchStatusEnum,
        seasonId: idSchema('seasonId'),
        stadiumId: idSchema('stadiumId'),
        homeTeamId: idSchema('homeTeamId'),
        awayTeamId: idSchema('awayTeamId'),
    })
    .refine((data) => data.homeTeamId !== data.awayTeamId, {
        message: 'The "homeTeamId" and "awayTeamId" cannot be the same',
        path: ['awayTeamId'],
    });

export const updateMatchSchema = z
    .object({
        dateTime: z
            .string({
                error: () => 'The "dateTime" field must be a valid ISO date string',
            })
            .datetime({ message: 'The "dateTime" field must be a valid ISO 8601 date string' })
            .optional(),
        status: MatchStatusEnum.optional(),
        seasonId: optionalIdSchema('seasonId'),
        stadiumId: optionalIdSchema('stadiumId'),
        homeTeamId: optionalIdSchema('homeTeamId'),
        awayTeamId: optionalIdSchema('awayTeamId'),
    })
    .refine(
        (data) => {
            if (data.homeTeamId !== undefined && data.awayTeamId !== undefined) {
                return data.homeTeamId !== data.awayTeamId;
            }
            return true;
        },
        {
            message: 'The "homeTeamId" and "awayTeamId" cannot be the same',
            path: ['awayTeamId'],
        }
    );

export const createMatchWithDbValidation = (prisma: PrismaClient) =>
    createMatchSchema.superRefine(async (data, ctx) => {
        const [season, stadium, homeTeam, awayTeam] = await Promise.all([
            prisma.season.findUnique({ where: { id: data.seasonId } }),
            prisma.stadium.findUnique({ where: { id: data.stadiumId } }),
            prisma.team.findUnique({ where: { id: data.homeTeamId } }),
            prisma.team.findUnique({ where: { id: data.awayTeamId } }),
        ]);
        if (!season) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Season with ID ${data.seasonId} does not exist`,
                path: ['seasonId'],
            });
        }
        if (!stadium) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Stadium with ID ${data.stadiumId} does not exist`,
                path: ['stadiumId'],
            });
        }
        if (!homeTeam) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Home Team with ID ${data.homeTeamId} does not exist`,
                path: ['homeTeamId'],
            });
        }
        if (!awayTeam) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Away Team with ID ${data.awayTeamId} does not exist`,
                path: ['awayTeamId'],
            });
        }
    });

export const updateMatchWithDbValidation = (prisma: PrismaClient) =>
    updateMatchSchema.superRefine(async (data, ctx) => {
        const checks = [];
        if (data.seasonId !== undefined) {
            checks.push(
                prisma.season.findUnique({ where: { id: data.seasonId } }).then((res) => {
                    if (!res) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: `Season with ID ${data.seasonId} does not exist`,
                            path: ['seasonId'],
                        });
                    }
                })
            );
        }
        if (data.stadiumId !== undefined) {
            checks.push(
                prisma.stadium.findUnique({ where: { id: data.stadiumId } }).then((res) => {
                    if (!res) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: `Stadium with ID ${data.stadiumId} does not exist`,
                            path: ['stadiumId'],
                        });
                    }
                })
            );
        }
        if (data.homeTeamId !== undefined) {
            checks.push(
                prisma.team.findUnique({ where: { id: data.homeTeamId } }).then((res) => {
                    if (!res) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: `Home Team with ID ${data.homeTeamId} does not exist`,
                            path: ['homeTeamId'],
                        });
                    }
                })
            );
        }
        if (data.awayTeamId !== undefined) {
            checks.push(
                prisma.team.findUnique({ where: { id: data.awayTeamId } }).then((res) => {
                    if (!res) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: `Away Team with ID ${data.awayTeamId} does not exist`,
                            path: ['awayTeamId'],
                        });
                    }
                })
            );
        }
        await Promise.all(checks);
    });

export type CreateMatchDTO = z.infer<typeof createMatchSchema>;
export type UpdateMatchDTO = z.infer<typeof updateMatchSchema>;