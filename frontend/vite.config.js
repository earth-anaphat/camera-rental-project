import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// host: true  -> เปิดให้มือถือ/iPad ในวงเดียวกันเข้าผ่าน IP ของเครื่องได้
export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5173 },
});
