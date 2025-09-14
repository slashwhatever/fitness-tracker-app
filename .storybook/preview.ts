import type { Preview } from '@storybook/nextjs-vite'
import '../src/app/globals.css'
import { initialize, mswLoader } from 'msw-storybook-addon'
import { handlers } from '../src/stories/mocks/handlers'

// Initialize MSW
initialize({
  onUnhandledRequest: 'warn',
});

// Set up mock environment variables for Storybook
if (typeof global !== 'undefined') {
  global.process = {
    ...global.process,
    env: {
      ...global.process?.env,
      NEXT_PUBLIC_SUPABASE_URL: 'https://mock-project.supabase.co',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: 'mock-anon-key',
    }
  };
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    },

    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/',
        query: {},
      },
    },

    // MSW configuration
    msw: {
      handlers: handlers,
    },
  },
  loaders: [mswLoader],
};

export default preview;