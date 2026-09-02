import { test, expect } from '@playwright/test';

test.describe('Team flow', () => {
    test('should allow completing the full CRUD flow for a team using mocks', async ({ page }) => {
        let teams = [
            {
                id: 1,
                name: 'Real Madrid CF',
                abbreviation: 'RMA',
                crest: 'https://example.com/rma.png',
                president: 'Florentino Pérez',
                homeMatches: [],
                awayMatches: [],
            },
        ];
        await page.route('**/api/teams', async (route) => {
            const method = route.request().method();
            if (method === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(teams),
                });
            } else if (method === 'POST') {
                const payload = route.request().postDataJSON();
                if (!payload.name || !payload.abbreviation) {
                    await route.fulfill({
                        status: 400,
                        contentType: 'application/json',
                        body: JSON.stringify({ error: 'Nombre y abreviatura son requeridos' }),
                    });
                    return;
                }
                const newTeam = {
                    id: Date.now(),
                    name: payload.name,
                    abbreviation: payload.abbreviation,
                    crest: payload.crest || null,
                    president: payload.president || null,
                    homeMatches: [],
                    awayMatches: [],
                };
                teams.push(newTeam);
                await route.fulfill({
                    status: 201,
                    contentType: 'application/json',
                    body: JSON.stringify(newTeam),
                });
            } else {
                await route.continue();
            }
        });
        await page.route(/\/api\/teams\/\d+$/, async (route) => {
            const method = route.request().method();
            const url = route.request().url();
            const id = Number(url.split('/').pop());
            if (method === 'GET') {
                const team = teams.find((t) => t.id === id);
                if (team) {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify(team),
                    });
                } else {
                    await route.fulfill({ status: 404 });
                }
            } else if (method === 'PUT') {
                const payload = route.request().postDataJSON();
                const index = teams.findIndex((t) => t.id === id);
                if (index !== -1) {
                    teams[index] = {
                        ...teams[index],
                        name: payload.name ?? teams[index].name,
                        abbreviation: payload.abbreviation ?? teams[index].abbreviation,
                        crest: payload.crest !== undefined ? payload.crest : teams[index].crest,
                        president: payload.president !== undefined ? payload.president : teams[index].president,
                    };
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify(teams[index]),
                    });
                } else {
                    await route.fulfill({ status: 404 });
                }
            } else if (method === 'DELETE') {
                teams = teams.filter((t) => t.id !== id);
                await route.fulfill({ status: 204 });
            } else {
                await route.continue();
            }
        });
        await page.goto('/teams');
        await expect(page.getByRole('row', { name: /Real Madrid CF/ })).toBeVisible();
        await page.getByRole('button', { name: '+ Nuevo Equipo' }).click();
        await expect(page).toHaveURL('/teams/new');
        await expect(page.getByRole('heading', { name: 'Nuevo Equipo' })).toBeVisible();
        await page.getByLabel('Nombre *').fill('FC Barcelona');
        await page.getByLabel('Abreviatura *').fill('FCB');
        await page.getByLabel('URL del Escudo').fill('https://example.com/fcb.png');
        await page.getByLabel('Presidente').fill('Joan Laporta');
        await page.getByRole('button', { name: 'Crear Equipo' }).click();
        await expect(page).toHaveURL('/teams');
        const createdRow = page.getByRole('row').filter({ hasText: 'FC Barcelona' });
        await expect(createdRow).toBeVisible();
        await createdRow.getByRole('button', { name: 'Ver' }).click();
        await expect(page).toHaveURL(/\/teams\/\d+\/info/);
        await expect(page.getByRole('heading', { name: 'FC Barcelona', level: 1 })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Detalles Generales' })).toBeVisible();
        await expect(page.getByRole('img', { name: 'Escudo de FC Barcelona' })).toBeVisible();
        await expect(page.getByText('Joan Laporta').first()).toBeVisible();
        await expect(page.getByText('FCB').first()).toBeVisible();
        await page.getByRole('button', { name: 'Editar' }).click();
        await expect(page).toHaveURL(/\/teams\/\d+\/edit/);
        await expect(page.getByRole('heading', { name: 'Editar Equipo' })).toBeVisible();
        await page.getByLabel('Nombre *').fill('FC Barcelona Editado');
        await page.getByLabel('Abreviatura *').fill('BAR');
        await page.getByRole('button', { name: 'Guardar Cambios' }).click();
        await expect(page).toHaveURL('/teams');
        const updatedRow = page.getByRole('row').filter({ hasText: 'FC Barcelona Editado' });
        await expect(updatedRow).toBeVisible();
        page.once('dialog', async (dialog) => {
            expect(dialog.type()).toBe('confirm');
            await dialog.accept();
        });
        await updatedRow.getByRole('button', { name: 'Eliminar' }).click();
        await expect(page.getByRole('row').filter({ hasText: 'FC Barcelona Editado' })).not.toBeVisible();
    });
});