// Ejemplo de test de regresión: formato a seguir para los nuevos tests.
const { test, expect } = require('@playwright/test');

test('el usuario de prueba inicia sesión y ve su saldo', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Correo').fill('ana@monedero.demo');
  await page.getByLabel('Contraseña').fill('demo1234');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page.getByText('Hola, Ana López')).toBeVisible();
  await expect(page.locator('#saldo')).toHaveText(/\$\d/);
});
