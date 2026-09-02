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
    a11y: { test: 'error' },
    options: {
      storySort: { order: ['Foundations', 'Actions', '*'] },
    },
  },
};
export default preview;
