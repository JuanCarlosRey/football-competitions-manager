import { test, expect } from '@playwright/test';

test.describe('Match flow', () => {
    test('should allow completing the full CRUD flow for a match using mocks', async ({ page }) => {
        // 1. Mocks auxiliares
        const mockTeams = [
            {
                id: 7,
                name: 'Real Madrid CF',
                abbreviation: 'RMA',
                crest: 'http://ejemplo.com/real-madrid.png',
                president: 'Florentino Pérez',
            },
            {
                id: 8,
                name: 'Internazionale Milano',
                abbreviation: 'INT',
                crest: 'http://ejemplo.com/inter.png',
                president: 'Giuseppe Marotta',
            },
            {
                id: 9,
                name: 'FC Barcelona',
                abbreviation: 'FCB',
                crest: 'http://ejemplo.com/barcelona.png',
                president: 'Joan Laporta',
            },
        ];

        const mockStadiums = [
            {
                id: 3,
                name: 'Santiago Bernabeu',
                capacity: 81044,
                address: 'Av. de la Concha Espina, 1, Madrid',
            },
            {
                id: 4,
                name: 'Spotify Camp Nou',
                capacity: 99354,
                address: 'C. d’Arístides Maillol, 12, Barcelona',
            },
        ];

        const mockSeasons = [
            {
                id: 5,
                year: '2026/2027',
                startDate: '2026-09-08T00:00:00.000Z',
                endDate: '2027-06-05T00:00:00.000Z',
                competitionId: 7,
            },
        ];

        // 2. Mock inicial de Matches estructurado según la API real
        let matches = [
            {
                id: 3,
                dateTime: '2026-09-08T20:00:00.000Z',
                status: 'SCHEDULED',
                seasonId: 5,
                stadiumId: 3,
                homeTeamId: 7,
                awayTeamId: 8,
                season: {
                    id: 5,
                    startDate: '2026-09-08T00:00:00.000Z',
                    endDate: '2027-06-05T00:00:00.000Z',
                    competitionId: 7,
                },
                stadium: {
                    id: 3,
                    name: 'Santiago Bernabeu',
                    capacity: 81044,
                    address: 'Av. de la Concha Espina, 1, Madrid',
                },
                homeTeam: {
                    id: 7,
                    name: 'Real Madrid CF',
                    abbreviation: 'RMA',
                    crest: 'http://ejemplo.com',
                    president: 'Florentino Pérez',
                },
                awayTeam: {
                    id: 8,
                    name: 'Internazionale Milano',
                    abbreviation: 'INT',
                    crest: 'http://ejemplo.com',
                    president: 'Giuseppe Marotta',
                },
            },
        ];

        await page.route('**/api/teams', async (route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockTeams) });
        });

        await page.route('**/api/stadiums', async (route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockStadiums) });
        });

        await page.route('**/api/seasons', async (route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockSeasons) });
        });

        // 3. Manejo de GET (lista) y POST (crear)
        await page.route('**/api/matches', async (route) => {
            const method = route.request().method();
            if (method === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(matches),
                });
            } else if (method === 'POST') {
                const payload = route.request().postDataJSON();

                const homeTeam = mockTeams.find((t) => t.id === Number(payload.homeTeamId))!;
                const awayTeam = mockTeams.find((t) => t.id === Number(payload.awayTeamId))!;
                const stadium = mockStadiums.find((s) => s.id === Number(payload.stadiumId))!;
                const season = mockSeasons.find((s) => s.id === Number(payload.seasonId))!;

                const newMatch = {
                    id: Date.now(),
                    dateTime: payload.dateTime,
                    status: payload.status,
                    homeTeamId: payload.homeTeamId,
                    awayTeamId: payload.awayTeamId,
                    stadiumId: payload.stadiumId,
                    seasonId: payload.seasonId,
                    homeTeam,
                    awayTeam: awayTeam!,
                    stadium,
                    season,
                };

                matches.push(newMatch);
                await route.fulfill({
                    status: 201,
                    contentType: 'application/json',
                    body: JSON.stringify(newMatch),
                });
            } else {
                await route.continue();
            }
        });

        // 4. Manejo por ID (GET, PUT, DELETE)
        await page.route(/\/api\/matches\/\d+$/, async (route) => {
            const method = route.request().method();
            const url = route.request().url();
            const id = Number(url.split('/').pop());

            if (method === 'GET') {
                const match = matches.find((m) => m.id === id);
                if (match) {
                    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(match) });
                } else {
                    await route.fulfill({ status: 404 });
                }
            } else if (method === 'PUT') {
                const payload = route.request().postDataJSON();
                const index = matches.findIndex((m) => m.id === id);

                if (index !== -1) {
                    const homeTeam = mockTeams.find((t) => t.id === Number(payload.homeTeamId ?? matches[index].homeTeamId))!;
                    const awayTeam = mockTeams.find((t) => t.id === Number(payload.awayTeamId ?? matches[index].awayTeamId))!;
                    const stadium = mockStadiums.find((s) => s.id === Number(payload.stadiumId ?? matches[index].stadiumId))!;

                    matches[index] = {
                        ...matches[index],
                        dateTime: payload.dateTime ?? matches[index].dateTime,
                        status: payload.status ?? matches[index].status,
                        homeTeamId: payload.homeTeamId ?? matches[index].homeTeamId,
                        awayTeamId: payload.awayTeamId ?? matches[index].awayTeamId,
                        stadiumId: payload.stadiumId ?? matches[index].stadiumId,
                        seasonId: payload.seasonId ?? matches[index].seasonId,
                        homeTeam,
                        awayTeam,
                        stadium,
                    };

                    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(matches[index]) });
                } else {
                    await route.fulfill({ status: 404 });
                }
            } else if (method === 'DELETE') {
                matches = matches.filter((m) => m.id !== id);
                await route.fulfill({ status: 204 });
            } else {
                await route.continue();
            }
        });

        // 5. Ejecución del flujo E2E
        await page.goto('/matches');
        await expect(page.getByRole('row', { name: /Real Madrid CF/ })).toBeVisible();

        await page.getByRole('button', { name: '+ Nuevo Partido' }).click();
        await expect(page).toHaveURL('/matches/new');

        await page.getByLabel('Fecha y Hora *').fill('2026-11-20T21:00');
        await page.getByLabel('Estado *').selectOption('SCHEDULED');
        await page.getByLabel('Equipo Local *').selectOption({ label: 'FC Barcelona' });
        await page.getByLabel('Equipo Visitante *').selectOption({ label: 'Internazionale Milano' });
        await page.getByLabel('Estadio *').selectOption({ label: 'Santiago Bernabeu' });
        await page.getByLabel('Temporada *').selectOption({ label: '2026/2027 (Competición #7)' });

        await page.getByRole('button', { name: 'Crear Partido' }).click();

        await expect(page).toHaveURL('/matches');
        const createdRow = page.getByRole('row').filter({ hasText: 'FC Barcelona' });
        await expect(createdRow).toBeVisible();

        await createdRow.getByRole('button', { name: 'Editar' }).click();
        await expect(page).toHaveURL(/\/matches\/\d+\/edit/);

        await page.getByLabel('Estado *').selectOption('FINISHED');
        await page.getByRole('button', { name: 'Guardar Cambios' }).click();

        await expect(page).toHaveURL('/matches');
        const updatedRow = page.getByRole('row').filter({ hasText: 'FC Barcelona' });
        await expect(updatedRow).toBeVisible();

        page.once('dialog', async (dialog) => {
            expect(dialog.type()).toBe('confirm');
            await dialog.accept();
        });

        await updatedRow.getByRole('button', { name: 'Eliminar' }).click();
        await expect(page.getByRole('row').filter({ hasText: 'FC Barcelona' })).not.toBeVisible();
    });
});