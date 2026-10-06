/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseAnonKey =
    env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

  return {
    plugins: [react(), tailwindcss()],
    define:
      mode === 'test'
        ? {}
        : {
            'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
            'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
          },
    test: {
      environment: 'node',
      include: ['src/**/*.test.ts'],
    },
  };
});
