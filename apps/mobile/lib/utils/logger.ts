const logger = {
  log: (...args: unknown[]) => {
    if (__DEV__) console.log(...args); // eslint-disable-line no-console
  },
  error: (...args: unknown[]) => {
    if (__DEV__) console.error(...args); // eslint-disable-line no-console
  },
  warn: (...args: unknown[]) => {
    if (__DEV__) console.warn(...args); // eslint-disable-line no-console
  },
};

export default logger;
