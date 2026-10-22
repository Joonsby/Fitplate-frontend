import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "fitplate",

  brand: {
    // 앱 기본 브랜드 색상 (로고 블루, src/index.css 의 --fp-blue)
    primaryColor: "#2F7FE0"
  },

  permissions: [],
  webBundleDir: "dist"
});
