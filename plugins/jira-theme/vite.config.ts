import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: './src/index.tsx',
      name: 'GalagaPlugin_JiraTheme',
      fileName: (format) => `index.js`,
      formats: ['umd']
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'lucide-react'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'lucide-react': 'Lucide'
        },
        name: 'GalagaPlugin_JiraTheme',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'style.css';
          return assetInfo.name as string;
        }
      }
    }
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});