import { defineConfig } from "tsup";
import fs from "fs";
import path from "path";

export default defineConfig({
  entry: {
    index: "src/index.tsx",
    server: "src/server.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  target: "es2022",
  external: ["react", "react-dom", "next", "next/server"],
  async onSuccess() {
    // Copy bundled CSS to dist/styles.css
    const srcCss = path.resolve("src/styles/overlay.css");
    const distCss = path.resolve("dist/styles.css");
    if (fs.existsSync(srcCss)) {
      fs.copyFileSync(srcCss, distCss);
      console.log("✓ dist/styles.css written");
    }
  },
});
