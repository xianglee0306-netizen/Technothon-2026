import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dashboardHandler from "./api/dashboard.js";

function attachApiRoute(server) {
  server.middlewares.use("/api/dashboard", async (req, res, next) => {
    res.status = (statusCode) => {
      res.statusCode = statusCode;
      return res;
    };

    res.json = (payload) => {
      if (!res.headersSent) {
        res.setHeader("Content-Type", "application/json");
      }

      res.end(JSON.stringify(payload));
    };

    try {
      await dashboardHandler(req, res);
    } catch (error) {
      next(error);
    }
  });
}

function localVercelApiPlugin() {
  return {
    name: "local-vercel-api",
    configureServer: attachApiRoute,
    configurePreviewServer: attachApiRoute
  };
}

export default defineConfig({
  plugins: [react(), localVercelApiPlugin()],
  server: {
    host: "127.0.0.1",
    port: 5173
  }
});
