import { test, expect } from '@playwright/test';

test.describe('Season flow', () => {
    test('should allow completing the full CRUD flow for a season using mocks', async ({ page }) => {
        let seasons = [
            {
                id: 1,
                startDate: '2025-01-01T00:00:00.000Z',
                endDate: '2025-06-30T00:00:00.000Z',
                competitionId: 10,
                competition: { id: 10, name: 'Liga Primavera' },
                matches: [],
            },
        ];
        const mockCompetitions = [
            { id: 10, name: 'Liga Primavera' },
            { id: 20, name: 'Copa Otoño' },
        ];
        await page.route('**/api/competitions', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockCompetitions),
            });
        });
        await page.route('**/api/seasons', async (route) => {
            const method = route.request().method();
            if (method === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(seasons),
                });
            } else if (method === 'POST') {
                const payload = route.request().postDataJSON();
                const selectedComp = mockCompetitions.find((c) => c.id === payload.competitionId);
                if (!selectedComp) {
                    await route.fulfill({
                        status: 400,
                        contentType: 'application/json',
                        body: JSON.stringify({ error: 'Competición no encontrada' }),
                    });
                    return;
                }
                const newSeason = {
                    id: Date.now(),
                    startDate: payload.startDate,
                    endDate: payload.endDate,
                    competitionId: payload.competitionId,
                    competition: selectedComp,
                    matches: [],
                };
                seasons.push(newSeason);
                await route.fulfill({
                    status: 201,
                    contentType: 'application/json',
                    body: JSON.stringify(newSeason),
                });
            } else {
                await route.continue();
            }
        });
        await page.route(/\/api\/seasons\/\d+$/, async (route) => {
            const method = route.request().method();
            const url = route.request().url();
            const id = Number(url.split('/').pop());
            if (method === 'GET') {
                const season = seasons.find((s) => s.id === id);
                if (season) {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify(season),
                    });
                } else {
                    await route.fulfill({ status: 404 });
                }
            } else if (method === 'PUT') {
                const payload = route.request().postDataJSON();
                const selectedComp = mockCompetitions.find((c) => c.id === payload.competitionId);
                const index = seasons.findIndex((s) => s.id === id);
                if (index !== -1) {
                    seasons[index] = {
                        ...seasons[index],
                        startDate: payload.startDate ?? seasons[index].startDate,
                        endDate: payload.endDate ?? seasons[index].endDate,
                        competitionId: payload.competitionId ?? seasons[index].competitionId,
                        competition: selectedComp || seasons[index].competition,
                    };
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify(seasons[index]),
                    });
                } else {
                    await route.fulfill({ status: 404 });
                }
            } else if (method === 'DELETE') {
                seasons = seasons.filter((s) => s.id !== id);
                await route.fulfill({ status: 204 });
            } else {
                await route.continue();
            }
        });
        await page.goto('/seasons');
        await expect(page.getByRole('row', { name: 'Liga Primavera' })).toBeVisible();
        await page.getByRole('button', { name: '+ Nueva Temporada' }).click();
        await expect(page).toHaveURL('/seasons/new');
        await expect(page.getByRole('heading', { name: 'Nueva Temporada' })).toBeVisible();
        await page.getByLabel('Fecha de Inicio *').fill('2026-09-01');
        await page.getByLabel('Fecha de Fin *').fill('2026-12-20');
        await page.getByLabel('Competición *').selectOption({ label: 'Liga Primavera' });
        await page.getByRole('button', { name: 'Crear Temporada' }).click();
        await expect(page).toHaveURL('/seasons');
        const createdRow = page.getByRole('row').filter({ hasText: 'Liga Primavera' }).last();
        await expect(createdRow).toBeVisible();
        await createdRow.getByRole('button', { name: 'Ver' }).click();
        await expect(page).toHaveURL(/\/seasons\/\d+\/info/);
        await expect(page.getByText('Información General')).toBeVisible();
        await expect(page.getByText('Partidos de la Temporada')).toBeVisible();
        await expect(page.getByText('Esta temporada no tiene partidos registrados.')).toBeVisible();
        await page.getByRole('button', { name: 'Editar' }).click();
        await expect(page).toHaveURL(/\/seasons\/\d+\/edit/);
        await expect(page.getByRole('heading', { name: 'Editar Temporada' })).toBeVisible();
        await page.getByLabel('Fecha de Fin *').fill('2026-12-31');
        await page.getByLabel('Competición *').selectOption({ label: 'Copa Otoño' });
        await page.getByRole('button', { name: 'Guardar Cambios' }).click();
        await expect(page).toHaveURL('/seasons');
        const updatedRow = page.getByRole('row').filter({ hasText: 'Copa Otoño' });
        await expect(updatedRow).toBeVisible();
        page.once('dialog', async (dialog) => {
            expect(dialog.type()).toBe('confirm');
            await dialog.accept();
        });
        await updatedRow.getByRole('button', { name: 'Eliminar' }).click();
        await expect(page.getByRole('row').filter({ hasText: 'Copa Otoño' })).not.toBeVisible();
    });
});