import { test, expect } from '@playwright/test';

test.describe('Player flow', () => {
    test('should allow completing the full CRUD flow for a player including team transfer using mocks', async ({ page }) => {
        let nextPlayerId = 100;
        const mockTeams = [
            { id: 1, name: 'FC Barcelona' },
            { id: 2, name: 'Real Madrid' },
        ];
        type MockPlayer = {
            id: number;
            firstName: string;
            lastName: string;
            birthDate: string;
            position: string;
            nationality: string;
            overall: number;
            height: number;
            weight: number;
            preferredFoot: string;
            marketValue: number | null;
            annualSalary: number | null;
            currentTeam: string | null;
            currentTeamId: number | null;
            teams: { teamId: number; team: { id: number; name: string } }[];
            playerStats: never[];
        };
        let players: MockPlayer[] = [
            {
                id: 1,
                firstName: 'Pedri',
                lastName: 'González',
                birthDate: '2002-11-25T00:00:00.000Z',
                position: 'CM',
                nationality: 'España',
                overall: 86,
                height: 1.74,
                weight: 68,
                preferredFoot: 'RIGHT',
                marketValue: 80000000,
                annualSalary: 9000000,
                currentTeam: 'FC Barcelona',
                currentTeamId: 1,
                teams: [{ teamId: 1, team: { id: 1, name: 'FC Barcelona' } }],
                playerStats: [],
            },
        ];
        await page.route('**/api/teams', async (route) => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(mockTeams),
                });
            } else {
                await route.continue();
            }
        });
        await page.route('**/api/team-players/player/*/career**', async (route) => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([]),
                });
            } else {
                await route.continue();
            }
        });
        await page.route('**/api/team-players/transfer', async (route) => {
            if (route.request().method() === 'POST') {
                const payload = route.request().postDataJSON();
                const playerIndex = players.findIndex((p) => p.id === Number(payload.playerId));
                const newTeam = mockTeams.find((t) => t.id === Number(payload.teamId));
                if (playerIndex !== -1 && newTeam) {
                    players[playerIndex] = {
                        ...players[playerIndex],
                        currentTeam: newTeam.name,
                        currentTeamId: newTeam.id,
                        teams: [{ teamId: newTeam.id, team: newTeam }],
                    };
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify(players[playerIndex]),
                    });
                } else {
                    await route.fulfill({ status: 400 });
                }
            } else {
                await route.continue();
            }
        });
        await page.route('**/api/players', async (route) => {
            const method = route.request().method();
            if (method === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(players),
                });
            } else if (method === 'POST') {
                const payload = route.request().postDataJSON();
                const assignedTeam = mockTeams.find((t) => t.id === Number(payload.teamId));
                const newPlayer = {
                    id: nextPlayerId++,
                    firstName: payload.firstName,
                    lastName: payload.lastName,
                    birthDate: payload.birthDate,
                    position: payload.position,
                    nationality: payload.nationality,
                    overall: payload.overall,
                    height: payload.height,
                    weight: payload.weight,
                    preferredFoot: payload.preferredFoot,
                    marketValue: payload.marketValue ?? null,
                    annualSalary: payload.annualSalary ?? null,
                    currentTeam: assignedTeam ? assignedTeam.name : null,
                    currentTeamId: assignedTeam ? assignedTeam.id : null,
                    teams: assignedTeam ? [{ teamId: assignedTeam.id, team: assignedTeam }] : [],
                    playerStats: [],
                };
                players.push(newPlayer);
                await route.fulfill({
                    status: 201,
                    contentType: 'application/json',
                    body: JSON.stringify(newPlayer),
                });
            } else {
                await route.continue();
            }
        });
        await page.route(/\/api\/players\/\d+/, async (route) => {
            const method = route.request().method();
            const url = route.request().url();
            const id = Number(url.split('?')[0].split('/').pop());
            if (method === 'GET') {
                const player = players.find((p) => p.id === id);
                if (player) {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify(player),
                    });
                } else {
                    await route.fulfill({ status: 404 });
                }
            } else if (method === 'PUT') {
                const payload = route.request().postDataJSON();
                const index = players.findIndex((p) => p.id === id);
                if (index !== -1) {
                    players[index] = {
                        ...players[index],
                        ...payload,
                    };
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify(players[index]),
                    });
                } else {
                    await route.fulfill({ status: 404 });
                }
            } else if (method === 'DELETE') {
                players = players.filter((p) => p.id !== id);
                await route.fulfill({ status: 204 });
            } else {
                await route.continue();
            }
        });
        const uniqueLastName = `Yamal ${Date.now()}`;
        const updatedLastName = `${uniqueLastName} - Modificado`;
        await page.goto('/players');
        await expect(page.getByRole('row', { name: /Pedri González/i })).toBeVisible();
        await page.getByRole('button', { name: '+ Nuevo Jugador' }).click();
        await expect(page).toHaveURL('/players/new');
        await expect(page.getByRole('heading', { name: 'Nuevo Jugador' })).toBeVisible();
        await page.getByLabel('Nombre *').fill('Lamine');
        await page.getByLabel('Apellido *').fill(uniqueLastName);
        await page.getByLabel('Fecha de Nacimiento *').fill('2007-07-13');
        await page.getByLabel('Nacionalidad *').fill('España');
        await page.getByLabel('Posición *').fill('RW');
        await page.getByLabel('Pie Preferido *').selectOption('LEFT');
        await page.getByLabel('Media (40-109) *').fill('81');
        await page.getByLabel('Altura (m) *').fill('1.80');
        await page.getByLabel('Peso (kg) *').fill('68');
        await page.getByLabel('Valor de Mercado (€)').fill('120000000');
        await page.getByLabel('Salario Anual (€)').fill('15000000');
        const teamSelect = page.getByLabel(/Equipo/i);
        if (await teamSelect.isVisible()) {
            await teamSelect.selectOption({ label: 'FC Barcelona' });
        }
        await page.getByRole('button', { name: 'Crear Jugador' }).click();
        await expect(page).toHaveURL('/players');
        const createdRow = page.getByRole('row', { name: new RegExp(uniqueLastName, 'i') });
        await expect(createdRow).toBeVisible();
        await expect(createdRow).toContainText('Lamine');
        await expect(createdRow).toContainText('RW');
        await createdRow.getByRole('button', { name: 'Ver' }).click();
        await expect(page).toHaveURL(/\/players\/\d+\/info/);
        await expect(page.getByRole('heading', { name: new RegExp(`Lamine ${uniqueLastName}`, 'i') })).toBeVisible();
        await expect(page.getByText('Información Personal y Deportiva')).toBeVisible();
        await expect(page.getByText('Izquierdo')).toBeVisible();
        const transferButton = page.getByRole('button', { name: /Traspasar|Cambiar Equipo/i });
        if (await transferButton.isVisible()) {
            await transferButton.click();
            await page.getByLabel(/Nuevo Equipo|Equipo Destino/i).selectOption({ label: 'Real Madrid' });
            await page.getByRole('button', { name: /Confirmar Traspaso|Guardar Traspaso/i }).click();
            await expect(page.getByText('Real Madrid')).toBeVisible();
        }
        await page.getByRole('button', { name: '← Volver' }).click();
        await expect(page).toHaveURL('/players');
        await page
            .getByRole('row', { name: new RegExp(uniqueLastName, 'i') })
            .getByRole('button', { name: 'Ver' })
            .click();
        await expect(page).toHaveURL(/\/players\/\d+\/info/);
        await page.getByRole('button', { name: 'Editar' }).click();
        await expect(page).toHaveURL(/\/players\/\d+\/edit/);
        await expect(page.getByRole('heading', { name: 'Editar Jugador' })).toBeVisible();
        await page.getByLabel('Apellido *').fill(updatedLastName);
        await page.getByLabel('Media (40-109) *').fill('85');
        await page.getByRole('button', { name: 'Guardar Cambios' }).click();
        await expect(page).toHaveURL('/players');
        const updatedRow = page.getByRole('row', { name: new RegExp(updatedLastName, 'i') });
        await expect(updatedRow).toBeVisible();
        await expect(updatedRow).toContainText('85');
        page.once('dialog', async (dialog) => {
            expect(dialog.type()).toBe('confirm');
            await dialog.accept();
        });
        await updatedRow.getByRole('button', { name: 'Eliminar' }).click();
        await expect(page.getByRole('cell', { name: updatedLastName })).not.toBeVisible();
    });
});