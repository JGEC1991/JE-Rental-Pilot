import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const supabaseUrl = process.env.VITE_SUPABASE_DATABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Vite Config - Supabase URL:', supabaseUrl);
console.log('Vite Config - Supabase Anon Key:', supabaseAnonKey);

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_SUPABASE_DATABASE_URL': JSON.stringify(supabaseUrl),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4321',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
