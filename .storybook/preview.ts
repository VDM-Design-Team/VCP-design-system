import '../dist/theme.css';
import type { Preview } from '@storybook/react-vite';

const preview: Preview = {
  parameters: {
    a11y: { test: 'error' }, // fail the story on a11y violations
    backgrounds: { default: 'canvas' },
  },
};
export default preview;
