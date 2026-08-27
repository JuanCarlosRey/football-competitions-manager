import { test, expect } from '@playwright/test';

test.describe('Organization flow', () => {
  test('should allow completing the full CRUD flow for an organization', async ({ page }) => {
    const uniqueOrgName = `Org Test ${Date.now()}`;
    const updatedOrgName = `${uniqueOrgName} - Editada`;
    await page.goto('/organizations');
    await page.getByRole('button', { name: '+ Nueva Organización' }).click();
    await expect(page).toHaveURL('/organizations/new');
    await expect(page.getByRole('heading', { name: 'Nueva Organización' })).toBeVisible();
    await page.getByLabel('Nombre de la Organización *').fill(uniqueOrgName);
    await page.getByRole('button', { name: 'Crear Organización' }).click();
    await expect(page).toHaveURL('/organizations');
    const createdRow = page.getByRole('row', { name: uniqueOrgName });
    await expect(createdRow).toBeVisible();
    await createdRow.getByRole('button', { name: 'Editar' }).click();
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