import { server } from "@tests/msw-server";
import { afterAll, afterEach, beforeAll } from "vitest";

export * from "./base.setup";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
