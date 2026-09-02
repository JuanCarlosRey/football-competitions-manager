import { test, expect } from '@playwright/test';

test.describe('Organization flow', () => {
  test('should allow completing the full CRUD flow for an organization using mocks', async ({ page }) => {
    let organizations = [
      {
        id: 1,
        name: 'Organización Inicial',
        competitions: [],
      },
    ];
    await page.route('**/api/organizations', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(organizations),
        });
      } else if (method === 'POST') {
        const payload = route.request().postDataJSON();
        const newOrg = {
          id: Date.now(),
          name: payload.name,
          competitions: [],
        };
        organizations.push(newOrg);
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(newOrg),
        });
      } else {
        await route.continue();
      }
    });
    await page.route(/\/api\/organizations\/\d+$/, async (route) => {
      const method = route.request().method();
      const url = route.request().url();
      const id = Number(url.split('/').pop());
      if (method === 'GET') {
        const org = organizations.find((o) => o.id === id);
        if (org) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(org),
          });
        } else {
          await route.fulfill({ status: 404 });
        }
      } else if (method === 'PUT') {
        const payload = route.request().postDataJSON();
        const index = organizations.findIndex((o) => o.id === id);
        if (index !== -1) {
          organizations[index] = {
            ...organizations[index],
            name: payload.name ?? organizations[index].name,
          };
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(organizations[index]),
          });
        } else {
          await route.fulfill({ status: 404 });
        }
      } else if (method === 'DELETE') {
        organizations = organizations.filter((o) => o.id !== id);
        await route.fulfill({ status: 204 });
      } else {
        await route.continue();
      }
    });
    const uniqueOrgName = `Org Test ${Date.now()}`;
    const updatedOrgName = `${uniqueOrgName} - Editada`;
    await page.goto('/organizations');
    await expect(page.getByRole('row', { name: 'Organización Inicial' })).toBeVisible();
    await page.getByRole('button', { name: '+ Nueva Organización' }).click();
    await expect(page).toHaveURL('/organizations/new');
    await expect(page.getByRole('heading', { name: 'Nueva Organización' })).toBeVisible();
    await page.getByLabel('Nombre de la Organización *').fill(uniqueOrgName);
    await page.getByRole('button', { name: 'Crear Organización' }).click();
    await expect(page).toHaveURL('/organizations');
    const createdRow = page.getByRole('row', { name: uniqueOrgName });
    await expect(createdRow).toBeVisible();
    await createdRow.getByRole('button', { name: 'Ver' }).click();
    await expect(page).toHaveURL(/\/organizations\/\d+\/info/);
    await expect(page.getByRole('heading', { name: uniqueOrgName })).toBeVisible();
    await expect(page.getByText('Información General')).toBeVisible();
    await expect(page.getByText('Competiciones Asociadas')).toBeVisible();
    await expect(page.getByText('Esta organización no tiene competiciones registradas.')).toBeVisible();
    await page.getByRole('button', { name: 'Editar' }).click();
    await expect(page).toHaveURL(/\/organizations\/\d+\/edit/);
    await expect(page.getByRole('heading', { name: 'Editar Organización' })).toBeVisible();
    await page.getByLabel('Nombre de la Organización *').fill(updatedOrgName);
    await page.getByRole('button', { name: 'Guardar Cambios' }).click();
    await expect(page).toHaveURL('/organizations');
    const updatedRow = page.getByRole('row', { name: updatedOrgName });
    await expect(updatedRow).toBeVisible();
    await expect(page.getByRole('cell', { name: uniqueOrgName, exact: true })).not.toBeVisible();
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });
    await updatedRow.getByRole('button', { name: 'Eliminar' }).click();
    await expect(page.getByRole('cell', { name: updatedOrgName })).not.toBeVisible();
  });
});