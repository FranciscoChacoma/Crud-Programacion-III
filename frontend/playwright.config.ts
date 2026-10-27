import { defineConfig } from '@playwright/test';

// Tests de aceptación (UAT) de punta a punta. Requieren el backend (8080) y el frontend (5173) corriendo.
// Usan el Google Chrome instalado en la PC, así que no hace falta descargar navegadores.
export default defineConfig({
  testDir: './e2e',
  timeout: 120_000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5173',
    channel: 'chrome',
    viewport: { width: 1440, height: 900 },
    screenshot: 'on',
    video: 'retain-on-failure',
    // Con --headed (modo demo) va más lento para que se vea cada paso.
    launchOptions: { slowMo: process.argv.includes('--headed') ? 350 : 0 },
  },
});
