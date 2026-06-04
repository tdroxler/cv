import { copyFile, mkdir } from "node:fs/promises";

await mkdir("dist", { recursive: true });
await copyFile("public/index.html", "dist/index.html");
await copyFile("public/styles.css", "dist/styles.css");
await copyFile("data/cv.json", "dist/cv.json");
