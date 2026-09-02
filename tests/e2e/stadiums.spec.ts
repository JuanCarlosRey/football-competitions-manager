import { test, expect } from '@playwright/test';

test.describe('Stadium flow', () => {
    test('should allow completing the full CRUD flow for a stadium using mocks', async ({ page }) => {
        let stadiums = [
            {
                id: 1,
                name: 'Santiago Bernabéu',
                capacity: 81044,
                address: 'Av. de Concha Espina, 1, Madrid',
                matches: [],
            },
        ];
        await page.route('**/api/stadiums', async (route) => {
            const method = route.request().method();
            if (method === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(stadiums),
                });
            } else if (method === 'POST') {
                const payload = route.request().postDataJSON();
                if (!payload.name || payload.capacity === undefined || !payload.address) {
                    await route.fulfill({
                        status: 400,
                        contentType: 'application/json',
                        body: JSON.stringify({ error: 'Nombre, capacidad y dirección son requeridos' }),
                    });
                    return;
                }
                const newStadium = {
                    id: Date.now(),
                    name: payload.name,
                    capacity: payload.capacity,
                    address: payload.address,
                    matches: [],
                };
                stadiums.push(newStadium);
                await route.fulfill({
                    status: 201,
                    contentType: 'application/json',
                    body: JSON.stringify(newStadium),
                });
            } else {
                await route.continue();
            }
        });
        await page.route(/\/api\/stadiums\/\d+$/, async (route) => {
            const method = route.request().method();
            const url = route.request().url();
            const id = Number(url.split('/').pop());
            if (method === 'GET') {
                const stadium = stadiums.find((s) => s.id === id);
                if (stadium) {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify(stadium),
                    });
                } else {
                    await route.fulfill({ status: 404 });
                }
            } else if (method === 'PUT') {
                const payload = route.request().postDataJSON();
                const index = stadiums.findIndex((s) => s.id === id);
                if (index !== -1) {
                    stadiums[index] = {
                        ...stadiums[index],
                        name: payload.name ?? stadiums[index].name,
                        capacity: payload.capacity ?? stadiums[index].capacity,
                        address: payload.address ?? stadiums[index].address,
                    };
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify(stadiums[index]),
                    });
                } else {
                    await route.fulfill({ status: 404 });
                }
            } else if (method === 'DELETE') {
                stadiums = stadiums.filter((s) => s.id !== id);
                await route.fulfill({ status: 204 });
            } else {
                await route.continue();
            }
        });
        await page.goto('/stadiums');
        await expect(page.getByRole('row', { name: /Santiago Bernabéu/ })).toBeVisible();
        await page.getByRole('button', { name: '+ Nuevo Estadio' }).click();
        await expect(page).toHaveURL('/stadiums/new');
        await expect(page.getByRole('heading', { name: 'Nuevo Estadio' })).toBeVisible();
        await page.getByLabel('Nombre *').fill('Camp Nou');
        await page.getByLabel('Capacidad *').fill('99354');
        await page.getByLabel('Dirección *').fill("C/ d'Aristides Maillol, 12, Barcelona");
        await page.getByRole('button', { name: 'Crear Estadio' }).click();
        await expect(page).toHaveURL('/stadiums');
        const createdRow = page.getByRole('row').filter({ hasText: 'Camp Nou' });
        await expect(createdRow).toBeVisible();
        await createdRow.getByRole('button', { name: 'Ver' }).click();
        await expect(page).toHaveURL(/\/stadiums\/\d+\/info/);
        await expect(page.getByRole('heading', { name: 'Camp Nou' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Información General' })).toBeVisible();
        await expect(page.getByText(/99[,.]354 espectadores/)).toBeVisible();
        await expect(page.getByText("C/ d'Aristides Maillol, 12, Barcelona")).toBeVisible();
        await page.getByRole('button', { name: 'Editar' }).click();
        await expect(page).toHaveURL(/\/stadiums\/\d+\/edit/);
        await expect(page.getByRole('heading', { name: 'Editar Estadio' })).toBeVisible();
        await page.getByLabel('Nombre *').fill('Spotify Camp Nou');
        await page.getByLabel('Capacidad *').fill('105000');
        await page.getByRole('button', { name: 'Guardar Cambios' }).click();
        await expect(page).toHaveURL('/stadiums');
        const updatedRow = page.getByRole('row').filter({ hasText: 'Spotify Camp Nou' });
        await expect(updatedRow).toBeVisible();
        page.once('dialog', async (dialog) => {
            expect(dialog.type()).toBe('confirm');
            await dialog.accept();
        });
        await updatedRow.getByRole('button', { name: 'Eliminar' }).click();
        await expect(page.getByRole('row').filter({ hasText: 'Spotify Camp Nou' })).not.toBeVisible();
    });
});