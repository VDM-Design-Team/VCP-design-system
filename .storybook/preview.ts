import './storybook.css';
import type { Preview } from '@storybook/react-vite';

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    a11y: { test: 'error' },
    options: {
      storySort: { order: ['Foundations', 'Actions', '*'] },
    },
  },
};
export default preview;
