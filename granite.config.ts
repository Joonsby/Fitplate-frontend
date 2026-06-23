import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "fitplate",
  brand: {
    displayName: "핏플레이트",
    primaryColor: "#3182F6", // TDS Button color="primary"에 적용되는 앱 기본 브랜드 색상입니다.
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
