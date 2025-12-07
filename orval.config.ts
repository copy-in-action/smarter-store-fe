import dotenv from "dotenv";
import { defineConfig } from "orval";

dotenv.config({ path: ".env.local" });

export default defineConfig({
  petstore: {
    input: `${process.env.API_SERVER}/v3/api-docs`,
    output: {
      mode: "split",
      target: "./src/shared/api/generated",
      client: "react-query",
      httpClient: "fetch",
      clean: true,
      prettier: true,
      schemas: "./src/shared/api/generated/schemas",
    },
  },
  petstoreZod: {
    input: {
      target: `${process.env.API_SERVER}/v3/api-docs`,
    },
    output: {
      mode: "tags-split",
      client: "zod",
      target: "./src/shared/api/generated/schemas",
      fileExtension: ".zod.ts",
    },
  },
});
