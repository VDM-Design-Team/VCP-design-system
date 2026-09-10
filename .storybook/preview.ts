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
    /* Every story is an axe test since the Vitest addon landed (9 Sep 2026),
       and a violation fails `npm test`. A side-by-side story that renders two
       landmarks on purpose spreads `SIDE_BY_SIDE` from src/lib/story-a11y
       into its parameters; nothing else is exempt. */
    a11y: { test: 'error' },
    options: {
      storySort: { order: ['Foundations', 'Actions', '*'] },
    },
  },
};
export default preview;
