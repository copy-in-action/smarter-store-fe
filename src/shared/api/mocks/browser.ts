import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

/**
 * 브라우저 환경에서 사용할 MSW worker
 */
export const worker = setupWorker(...handlers);
