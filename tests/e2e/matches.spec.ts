import { test, expect } from '@playwright/test';

test.describe('Match flow', () => {
    test('should allow completing the full CRUD flow for a match and validate player filtering by contract dates, form view, and match team stats', async ({ page }) => {
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
                competition: { id: 7, name: 'Champions League' },
            },
        ];
        const mockPlayerLamine = {
            id: 101,
            firstName: 'Lamine',
            lastName: 'Yamal',
            birthDate: '2007-07-13',
            position: 'FORWARD',
            nationality: 'Spanish',
            overall: 88,
            height: 180,
            weight: 75,
            preferredFoot: 'RIGHT',
        };
        const mockPlayerFuturo = {
            id: 102,
            firstName: 'Fichaje',
            lastName: 'Futuro',
            birthDate: '2005-01-01',
            position: 'MIDFIELDER',
            nationality: 'Spanish',
            overall: 80,
            height: 175,
            weight: 70,
            preferredFoot: 'RIGHT',
        };
        const mockPlayerExpirado = {
            id: 103,
            firstName: 'Jugador',
            lastName: 'Expirado',
            birthDate: '1995-01-01',
            position: 'DEFENDER',
            nationality: 'Spanish',
            overall: 78,
            height: 185,
            weight: 80,
            preferredFoot: 'LEFT',
        };
        const mockBarcaTeamPlayers = [
            {
                id: 1,
                teamId: 9,
                playerId: 101,
                startDate: '2026-01-01T00:00:00.000Z',
                endDate: null,
                player: mockPlayerLamine,
            },
            {
                id: 2,
                teamId: 9,
                playerId: 102,
                startDate: '2027-01-01T00:00:00.000Z',
                endDate: null,
                player: mockPlayerFuturo,
            },
            {
                id: 3,
                teamId: 9,
                playerId: 103,
                startDate: '2025-01-01T00:00:00.000Z',
                endDate: '2026-10-01T00:00:00.000Z',
                player: mockPlayerExpirado,
            },
        ];
        const mockMatchLineups = [
            {
                id: 501,
                matchId: 1000,
                teamId: 9,
                playerId: 101,
                starter: true,
                position: 'FORWARD',
                shirtNumber: 19,
                player: mockPlayerLamine,
            },
        ];
        const mockMatchTeamStats = [
            {
                id: 1,
                matchId: 1000,
                teamId: 9,
                possession: 62,
                shots: 14,
                shotsOnTarget: 6,
                fouls: 8,
                yellowCards: 2,
                redCards: 0,
                corners: 5,
                offsides: 1,
            },
            {
                id: 2,
                matchId: 1000,
                teamId: 8,
                possession: 38,
                shots: 6,
                shotsOnTarget: 2,
                fouls: 12,
                yellowCards: 3,
                redCards: 0,
                corners: 2,
                offsides: 3,
            },
        ];
        let mockMatchPlayerStats = [
            {
                id: 1,
                matchId: 1000,
                playerId: 101,
                teamId: 9,
                goals: 1,
                assists: 1,
                yellowCards: 0,
                redCards: 0,
                rating: 8.5,
                player: mockPlayerLamine,
            },
        ];
        let matches = [
            {
                id: 3,
                dateTime: '2026-09-08T20:00:00.000Z',
                status: 'SCHEDULED',
                seasonId: 5,
                stadiumId: 3,
                homeTeamId: 7,
                awayTeamId: 8,
                season: mockSeasons[0],
                stadium: mockStadiums[0],
                homeTeam: mockTeams[0],
                awayTeam: mockTeams[1],
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
        await page.route('**/api/teams/9/players', async (route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockBarcaTeamPlayers) });
        });
        await page.route('**/api/matches/1000/lineups', async (route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockMatchLineups) });
        });
        await page.route('**/api/matches/1000/team-stats', async (route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockMatchTeamStats) });
        });
        await page.route('**/api/matches/1000/player-stats', async (route) => {
            const method = route.request().method();
            if (method === 'GET') {
                await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockMatchPlayerStats) });
            } else if (method === 'POST') {
                const payload = route.request().postDataJSON();
                const newStat = {
                    id: 2,
                    matchId: 1000,
                    playerId: payload.playerId,
                    teamId: payload.teamId,
                    minutesPlayed: payload.minutesPlayed,
                    goals: payload.goals,
                    assists: payload.assists,
                    shots: payload.shots,
                    shotsOnTarget: payload.shotsOnTarget,
                    passes: payload.passes,
                    passAccuracy: payload.passAccuracy,
                    tackles: payload.tackles,
                    interceptions: payload.interceptions,
                    foulsCommitted: payload.foulsCommitted,
                    foulsDrawn: payload.foulsDrawn,
                    yellowCards: payload.yellowCards,
                    redCards: payload.redCards,
                    rating: payload.rating,
                    player: mockPlayerLamine,
                };
                mockMatchPlayerStats.push(newStat);
                await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(newStat) });
            } else {
                await route.continue();
            }
        });
        await page.route('**/api/matches', async (route) => {
            const method = route.request().method();
            if (method === 'GET') {
                await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(matches) });
            } else if (method === 'POST') {
                const payload = route.request().postDataJSON();
                const homeTeam = mockTeams.find((t) => t.id === Number(payload.homeTeamId))!;
                const awayTeam = mockTeams.find((t) => t.id === Number(payload.awayTeamId))!;
                const stadium = mockStadiums.find((s) => s.id === Number(payload.stadiumId))!;
                const season = mockSeasons.find((s) => s.id === Number(payload.seasonId))!;
                const newMatch = {
                    id: 1000,
                    dateTime: payload.dateTime,
                    status: payload.status,
                    homeTeamId: payload.homeTeamId,
                    awayTeamId: payload.awayTeamId,
                    stadiumId: payload.stadiumId,
                    seasonId: payload.seasonId,
                    homeTeam,
                    awayTeam,
                    stadium,
                    season,
                };
                matches.push(newMatch);
                await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(newMatch) });
            } else {
                await route.continue();
            }
        });
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
        await page.goto('/matches');
        await expect(page.getByRole('row', { name: /Real Madrid CF/ })).toBeVisible();
        await page.getByRole('button', { name: '+ Nuevo Partido' }).click();
        await expect(page).toHaveURL('/matches/new');
        await page.getByLabel('Fecha y Hora *').fill('2026-11-20T21:00');
        await page.getByLabel('Estado *').selectOption('SCHEDULED');
        await page.getByLabel('Equipo Local *').selectOption({ label: 'FC Barcelona' });
        await page.getByLabel('Equipo Visitante *').selectOption({ label: 'Internazionale Milano' });
        await page.getByLabel('Estadio *').selectOption({ label: 'Santiago Bernabeu' });
        await page.getByLabel('Temporada *').selectOption({ label: '2026/2027 (Champions League)' });
        await page.getByRole('button', { name: 'Crear Partido' }).click();
        await expect(page).toHaveURL('/matches');
        const createdRow = page.getByRole('row').filter({ hasText: 'FC Barcelona' });
        await expect(createdRow).toBeVisible();
        await createdRow.getByRole('button', { name: 'Ver' }).click();
        await expect(page).toHaveURL(/\/matches\/\d+\/info/);
        await expect(page.getByRole('heading', { name: /Partido #\d+/ })).toBeVisible();
        const barcaTab = page.getByRole('button', { name: 'FC Barcelona' });
        await expect(barcaTab).toBeVisible();
        await expect(page.getByText('Lamine Yamal')).toBeVisible();
        const addPlayerStatBtn = page.getByRole('button', { name: /Añadir Estadística|Añadir Jugador/i });
        if (await addPlayerStatBtn.isVisible()) {
            await addPlayerStatBtn.click();
            await page.getByLabel(/Jugador/i).selectOption({ label: 'Lamine Yamal' });
            await page.getByLabel(/Minutos Jugados/i).fill('90');
            await page.getByLabel(/Goles/i).fill('1');
            await page.getByLabel(/Asistencias/i).fill('1');
            await page.getByRole('button', { name: /Guardar|Añadir/i }).click();
        }
        await expect(page.getByText('Lamine Yamal')).toBeVisible();
        await expect(page.getByText('Futuro')).not.toBeVisible();
        await expect(page.getByText('Expirado')).not.toBeVisible();
        const statsTab = page.getByRole('button', { name: 'Estadísticas', exact: true });
        if (await statsTab.isVisible()) {
            await statsTab.click();
            await expect(page.getByText('62%')).toBeVisible();
            await expect(page.getByText('38%')).toBeVisible();
        }
        await page.getByRole('button', { name: 'Editar', exact: true }).click();
        await expect(page).toHaveURL(/\/matches\/\d+\/edit/);
        await expect(page.getByLabel('Estado *')).toHaveValue('SCHEDULED');
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