import './storybook.css';
import type { Preview } from '@storybook/react-vite';

const preview: Preview = {
  tags: ['autodocs'],
  globalTypes: {
    theme: {
      description: 'VCP color theme',
      toolbar: {
        title: 'Theme',
        icon: 'sun',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  decorators: [
    // The dark theme is the same semantic tokens with `.dark` overrides.
    // The class goes on <html> so portalled overlays (Modal, Toast) are
    // themed too — a wrapper div around the story would miss them.
    (Story, context) => {
      document.documentElement.classList.toggle('dark', context.globals.theme === 'dark');
      return Story();
    },
  ],
  parameters: {
    /* Every story is an axe test since the Vitest addon landed (9 Sep 2026).
       Twenty-two stories fail today — see the issue linked from the PR that
       added the runner. 'todo' reports them in the panel and the test output
       without failing the run; flip to 'error' once they are fixed. */
    a11y: { test: 'todo' },
    options: {
      storySort: { order: ['Foundations', 'Actions', '*'] },
    },
  },
};
export default preview;
