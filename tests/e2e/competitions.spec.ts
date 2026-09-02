import { test, expect } from '@playwright/test';

test.describe('Competition flow', () => {
    test('should allow completing the full CRUD flow for a competition using mocks', async ({ page }) => {
        let competitions = [
            {
                id: 1,
                name: 'Competición Inicial',
                organizationId: 10,
                organization: { id: 10, name: 'Organización A' },
                seasons: [],
            },
        ];
        const mockOrganizations = [
            { id: 10, name: 'Organización A' },
            { id: 20, name: 'Organización B' },
        ];
        await page.route('**/api/organizations', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockOrganizations),
            });
        });
        await page.route('**/api/competitions', async (route) => {
            const method = route.request().method();
            if (method === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(competitions),
                });
            } else if (method === 'POST') {
                const payload = route.request().postDataJSON();
                const selectedOrg = mockOrganizations.find((o) => o.id === payload.organizationId);
                if (!selectedOrg) {
                    await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ error: 'Organización no encontrada' }) });
                    return;
                }
                const newComp = {
                    id: Date.now(),
                    name: payload.name,
                    organizationId: payload.organizationId,
                    organization: selectedOrg,
                    seasons: [],
                };
                competitions.push(newComp);
                await route.fulfill({
                    status: 201,
                    contentType: 'application/json',
                    body: JSON.stringify(newComp),
                });
            } else {
                await route.continue();
            }
        });
        await page.route(/\/api\/competitions\/\d+$/, async (route) => {
            const method = route.request().method();
            const url = route.request().url();
            const id = Number(url.split('/').pop());
            if (method === 'GET') {
                const comp = competitions.find((c) => c.id === id);
                if (comp) {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify(comp),
                    });
                } else {
                    await route.fulfill({ status: 404 });
                }
            } else if (method === 'PUT') {
                const payload = route.request().postDataJSON();
                const selectedOrg = mockOrganizations.find((o) => o.id === payload.organizationId);
                const index = competitions.findIndex((c) => c.id === id);
                if (index !== -1) {
                    competitions[index] = {
                        ...competitions[index],
                        name: payload.name ?? competitions[index].name,
                        organizationId: payload.organizationId ?? competitions[index].organizationId,
                        organization: selectedOrg || competitions[index].organization,
                    };
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify(competitions[index]),
                    });
                } else {
                    await route.fulfill({ status: 404 });
                }
            } else if (method === 'DELETE') {
                competitions = competitions.filter((c) => c.id !== id);
                await route.fulfill({ status: 204 });
            } else {
                await route.continue();
            }
        });
        const uniqueCompName = `Champions League ${Date.now()}`;
        const updatedCompName = `${uniqueCompName} - Modificada`;
        await page.goto('/competitions');
        await expect(page.getByRole('row', { name: 'Competición Inicial' })).toBeVisible();
        await page.getByRole('button', { name: '+ Nueva Competición' }).click();
        await expect(page).toHaveURL('/competitions/new');
        await expect(page.getByRole('heading', { name: 'Nueva Competición' })).toBeVisible();
        await page.getByLabel('Nombre de la Competición *').fill(uniqueCompName);
        await page.getByLabel('Organización *').selectOption({ label: 'Organización A' });
        await page.getByRole('button', { name: 'Crear Competición' }).click();
        await expect(page).toHaveURL('/competitions');
        const createdRow = page.getByRole('row', { name: uniqueCompName });
        await expect(createdRow).toBeVisible();
        await expect(createdRow).toContainText('Organización A');
        await createdRow.getByRole('button', { name: 'Ver' }).click();
        await expect(page).toHaveURL(/\/competitions\/\d+\/info/);
        await expect(page.getByRole('heading', { name: uniqueCompName })).toBeVisible();
        await expect(page.getByText('Información General')).toBeVisible();
        await expect(page.getByText('Organización A')).toBeVisible();
        await page.getByRole('button', { name: '← Volver' }).click();
        await expect(page).toHaveURL('/competitions');
        await page.getByRole('row', { name: uniqueCompName }).getByRole('button', { name: 'Ver' }).click();
        await expect(page).toHaveURL(/\/competitions\/\d+\/info/);
        await page.getByRole('button', { name: 'Editar' }).click();
        await expect(page).toHaveURL(/\/competitions\/\d+\/edit/);
        await expect(page.getByRole('heading', { name: 'Editar Competición' })).toBeVisible();
        await page.getByLabel('Nombre de la Competición *').fill(updatedCompName);
        await page.getByLabel('Organización *').selectOption({ label: 'Organización B' });
        await page.getByRole('button', { name: 'Guardar Cambios' }).click();
        await expect(page).toHaveURL('/competitions');
        const updatedRow = page.getByRole('row', { name: updatedCompName });
        await expect(updatedRow).toBeVisible();
        await expect(updatedRow).toContainText('Organización B');
        page.once('dialog', async (dialog) => {
            expect(dialog.type()).toBe('confirm');
            await dialog.accept();
        });
        await updatedRow.getByRole('button', { name: 'Eliminar' }).click();
        await expect(page.getByRole('cell', { name: updatedCompName })).not.toBeVisible();
    });
});