import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { loadEnv } from "vite";
import handler from "./api/[...route]";
import { readFile } from 'node:fs/promises';
import path from 'node:path';
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "local-api",
      configureServer(server) {
        Object.assign(process.env, loadEnv(mode, process.cwd(), ""));
        server.middlewares.use('/uploads',async(req,res)=>{
          const name=(req.url||'').split('?')[0].slice(1);
          if(!/^[a-f0-9-]{36}\.webp$/.test(name)||!['GET','HEAD'].includes(req.method||'')){res.statusCode=404;res.end();return;}
          try{const bytes=await readFile(path.join(process.cwd(),'public','uploads',name));res.setHeader('Content-Type','image/webp');res.setHeader('Cache-Control','public, max-age=31536000, immutable');res.end(req.method==='HEAD'?undefined:bytes);}catch{res.statusCode=404;res.end();}
        });
        server.middlewares.use("/api", (req, res) => {
          req.url = "/api" + req.url;
          void handler(req, res);
        });
      },
    },
  ],
  server: { port: 5173, strictPort: true },
  build: { rollupOptions: { output: { manualChunks: {
    motion: ['framer-motion'],
    react: ['react', 'react-dom', 'react-router-dom'],
  } } } },
}));
