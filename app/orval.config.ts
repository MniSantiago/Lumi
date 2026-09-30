import { defineConfig } from 'orval';

/**
 * Cliente de la API de Lampi generado desde el OpenAPI del backend.
 * Regenerar: `npm run api:generate` (antes, en backend/: `npm run openapi`).
 */
export default defineConfig({
  lumi: {
    input: '../backend/openapi.json',
    output: {
      target: './src/api/generated.ts',
      client: 'fetch',
      mode: 'single',
      clean: false,
      override: {
        mutator: { path: './src/api/client.ts', name: 'apiFetch' },
        fetch: { includeHttpResponseReturnType: false },
      },
    },
  },
});
