import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "fitplate",
  brand: {
    displayName: "핏플레이트",
    primaryColor: "#2F7FE0", // 앱 기본 브랜드 색상 (로고 블루, src/index.css 의 --fp-blue)
    icon: "https://static.toss.im/appsintoss/43801/51460797-5c1e-431f-b0e9-14407cfbca5f.png",
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite dev --host 0.0.0.0",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
});
