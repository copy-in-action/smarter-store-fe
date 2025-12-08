import dotenv from "dotenv";
import { defineConfig } from "orval";

dotenv.config({ path: ".env.local" });

export default defineConfig({
  petstore: {
    input: `${process.env.NEXT_PUBLIC_API_SERVER}/v3/api-docs`,
    output: {
      baseUrl: process.env.NEXT_PUBLIC_API_SERVER,
      mode: "tags-split",
      target: "./src/shared/api/orval",
      client: "fetch",
      httpClient: "fetch",
      clean: true,
      prettier: true,
      schemas: "./src/shared/api/orval/types",
      override: {
        mutator: {
          path: "./src/shared/api/fetch-wrapper.ts",
          name: "orvalFetch",
        },
      },
    },
  },
});
