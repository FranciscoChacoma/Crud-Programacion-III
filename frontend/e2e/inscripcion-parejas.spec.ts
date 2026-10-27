import { expect, test, type Page } from '@playwright/test';

/*
 * UAT – Equipo 3: aceptación de inscripción de parejas y validación de categoría.
 *
 * Criterios:
 *  1. La inscripción rechaza jugadores fuera de la categoría del torneo
 *     (su categoría o una abajo: en un torneo de 6ta sólo juegan los de 6ta y los de 7ma).
 *  2. Al inscribir una pareja válida, su badge de categoría en la tabla del torneo queda en verde.
 *  3. Con las parejas y una sede con canchas, se genera automáticamente el fixture visual.
 */

const run = Date.now().toString().slice(-6);

interface PlayerData { name: string; lastName: string; category: string }

const PAIRS: [PlayerData, PlayerData][] = [
  [{ name: 'Martín', lastName: 'Gómez', category: 'A6' }, { name: 'Lucas', lastName: 'Fernández', category: 'A7' }],
  [{ name: 'Santiago', lastName: 'Rodríguez', category: 'A6' }, { name: 'Nicolás', lastName: 'López', category: 'A6' }],
  [{ name: 'Federico', lastName: 'Martínez', category: 'A7' }, { name: 'Agustín', lastName: 'Pérez', category: 'A6' }],
  [{ name: 'Joaquín', lastName: 'García', category: 'A6' }, { name: 'Tomás', lastName: 'Sánchez', category: 'A7' }],
];
const FRANJAS = ['09:00 – 12:00', '12:00 – 15:00', '15:00 – 18:00'];

const email = (p: PlayerData) =>
  `${p.name}.${p.lastName}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') + '@example.com';

async function fillPlayer(page: Page, index: 0 | 1, p: PlayerData) {
  await page.getByLabel('Nombre', { exact: true }).nth(index).fill(p.name);
  await page.getByLabel('Apellido', { exact: true }).nth(index).fill(p.lastName);
  await page.getByLabel('Email', { exact: true }).nth(index).fill(email(p));
  await page.getByLabel('Categoría del jugador').nth(index).selectOption(p.category);
}

async function fillPair(page: Page, pair: [PlayerData, PlayerData]) {
  await fillPlayer(page, 0, pair[0]);
  await fillPlayer(page, 1, pair[1]);
  for (const f of FRANJAS) await page.getByText(f, { exact: true }).click();
}

test('inscripción de parejas con validación de categoría y fixture automático', async ({ page }) => {
  await test.step('El organizador crea su cuenta', async () => {
    await page.goto('/register');
    await page.getByLabel('Nombre').fill('Organizador UAT');
    await page.getByLabel('Email').fill(`uat${run}@padelpro.test`);
    await page.getByLabel('Contraseña').fill('uat12345');
    await page.getByRole('button', { name: 'Crear cuenta' }).click();
    await expect(page).toHaveURL(/dashboard/);
  });

  await test.step('Crea un torneo de 6ta categoría', async () => {
    await page.getByRole('button', { name: 'Nuevo torneo' }).first().click();
    await page.getByLabel('Nombre del torneo').fill(`Torneo UAT 6ta ${run}`);
    await page.getByLabel('Categoría').selectOption('A6');
    await page.getByRole('button', { name: 'Crear torneo' }).click();
    await expect(page.getByRole('heading', { name: `Torneo UAT 6ta ${run}` })).toBeVisible();
  });

  await test.step('Rechaza a un jugador de 5ta en un torneo de 6ta', async () => {
    await page.getByRole('button', { name: 'Inscribir pareja' }).first().click();
    await fillPair(page, [
      { name: 'Diego', lastName: 'Ruiz', category: 'A5' },
      { name: 'Pablo', lastName: 'Ramírez', category: 'A6' },
    ]);
    await page.getByRole('button', { name: 'Inscribir pareja' }).click();
    await expect(page.getByRole('alert')).toContainText('es de 5ta');
    await expect(page.getByRole('alert')).toContainText('sólo pueden jugar jugadores de 6ta o de 7ma');
    await expect(page).toHaveURL(/pairs\/new/);
  });

  await test.step('También rechaza a uno de 8va (dos categorías abajo)', async () => {
    await page.getByLabel('Categoría del jugador').nth(0).selectOption('A8');
    await page.getByRole('button', { name: 'Inscribir pareja' }).click();
    await expect(page.getByRole('alert')).toContainText('es de 8va');
    await page.getByRole('button', { name: 'Cancelar' }).click();
  });

  for (const [i, pair] of PAIRS.entries()) {
    await test.step(`Inscribe la pareja válida ${i + 1}: ${pair[0].lastName} / ${pair[1].lastName}`, async () => {
      await page.getByRole('button', { name: 'Inscribir pareja' }).first().click();
      await fillPair(page, pair);
      await page.getByRole('button', { name: 'Inscribir pareja' }).click();
      await expect(page).toHaveURL(/tournaments\/[^/]+$/);
      await expect(page.getByText('Pareja inscripta').last()).toBeVisible();

      const row = page.getByRole('row').filter({ hasText: `${pair[0].name} ${pair[0].lastName}` });
      const badge = row.getByTestId('category-badge');
      await expect(badge).toHaveAttribute('data-valid', 'true');
      await expect(badge.locator('.badge')).toHaveClass(/badge-success/);
      await expect(badge.locator('.badge')).toHaveCSS('color', /rgb\(7, 148, 85\)|rgb\(71, 205, 137\)/);
    });
  }

  await test.step('Carga una sede con 2 canchas', async () => {
    await page.getByRole('link', { name: /Sedes y canchas/ }).click();
    await page.getByLabel('Nueva sede').fill(`Sede UAT ${run}`);
    await page.getByRole('button', { name: 'Crear sede' }).click();
    const venue = page.locator('.venue').filter({ hasText: `Sede UAT ${run}` });
    await venue.getByRole('button', { name: 'Cancha', exact: true }).click();
    await expect(venue.locator('.court-chip')).toHaveCount(1);
    await venue.getByRole('button', { name: 'Cancha', exact: true }).click();
    await expect(venue.locator('.court-chip')).toHaveCount(2);
  });

  await test.step('Genera el fixture automáticamente', async () => {
    await page.getByRole('link', { name: /Fase de grupos/ }).click();
    await page.getByRole('button', { name: 'Generar grupos y horarios' }).click();
    await expect(page.getByText('Grupo A').first()).toBeVisible();
    // 4 parejas = 1 grupo de 4 = 6 partidos, todos con horario.
    await expect(page.locator('.result-row')).toHaveCount(6);
    await expect(page.locator('.result-row .result-time').filter({ hasText: '—' })).toHaveCount(0);

    await page.getByRole('radio', { name: 'Grilla horaria' }).click();
    await expect(page.locator('td .sched-card')).toHaveCount(6);
    await expect(page.getByText('Sin horario (0)')).toBeVisible();
  });
});
