import type { Request, Response } from 'express';
import * as organizationService from '../services/organization.service.js';
import { createOrganizationSchema } from '../schemas/organization.schema.js';
import z from 'zod';

export async function getOrganizations(req: Request, res: Response) {
    try {
        const organizations = await organizationService.getAll();
        res.json(organizations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error obtaining organizations' });
    }
}

export async function getOrganizationById(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid organization ID' });
        }
        const organization = await organizationService.getById(id);
        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }
        res.json(organization);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error obtaining organization' });
    }
}

export async function createOrganization(req: Request, res: Response) {
    try {
        const validatedData = createOrganizationSchema.parse(req.body);
        
        const newOrganization = await organizationService.create(validatedData);
        res.status(201).json(newOrganization);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        console.error(error);
        res.status(500).json({ error: 'Error creating organization' });
    }
}

export async function updateOrganization(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid organization ID' });
        }
        const { name } = req.body;
        const updatedOrganization = await organizationService.update(id, { name });
        res.json(updatedOrganization);
    } catch (error: unknown) {
        console.error(error);
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
            return res.status(404).json({ error: 'Organization not found' });
        }
        res.status(500).json({ error: 'Error updating organization' });
    }
}

export async function deleteOrganization(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid organization ID' });
        }
        await organizationService.deleteOrganization(id);
        res.status(204).send();
    } catch (error: unknown) {
        console.error(error);
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
            return res.status(404).json({ error: 'Organization not found' });
        }
        res.status(500).json({ error: 'Error deleting organization' });
    }
}