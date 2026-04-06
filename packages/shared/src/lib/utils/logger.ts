/**
 * Cross-platform logger that is silenced in production.
 *
 * Works in React Native (Metro, where `__DEV__` is a global) and in
 * Next.js / Node (where `process.env.NODE_ENV` is the canonical flag).
 */

// React Native / Expo sets `__DEV__` as a global boolean.
// Access it via globalThis so TypeScript doesn't complain about an undeclared identifier.
const rnDev = (globalThis as Record<string, unknown>)["__DEV__"];
const isDev: boolean =
  typeof rnDev === "boolean"
    ? rnDev
    : process.env.NODE_ENV !== "production";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LogArgs = any[];

const logger = {
  log(...args: LogArgs): void {
    if (isDev) {
      console.log(...args); // eslint-disable-line no-console
    }
  },
  warn(...args: LogArgs): void {
    if (isDev) {
      console.warn(...args); // eslint-disable-line no-console
    }
  },
  error(...args: LogArgs): void {
    if (isDev) {
      console.error(...args); // eslint-disable-line no-console
    }
  },
};

export default logger;
