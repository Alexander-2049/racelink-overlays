import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { racelinkOverlay } from '@racelink/overlay/vite';

export default defineConfig({
  plugins: [react(), racelinkOverlay()],
});
