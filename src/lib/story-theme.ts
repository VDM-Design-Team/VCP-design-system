import * as React from 'react';
import { addons } from 'storybook/preview-api';
import { GLOBALS_UPDATED, UPDATE_GLOBALS } from 'storybook/internal/core-events';

/**
 * The app's half of the theme, for stories: a `TopBar`'s light/dark switch, linked to Storybook's own theme control, both ways.
 * Pressing the switch changes the toolbar's theme (and so the whole story); changing the toolbar moves the switch.
 *
 *     const Bar = () => {
 *       const theme = useToolbarTheme();
 *       return <TopBar {...theme} ... />;
 *     };
 *
 * It talks to Storybook over its channel rather than its hooks, so it works inside any component, not only a story's `render`.
 * Where there is no channel (a story run outside Storybook's preview) it still returns a working switch that changes nothing.
 */
export function useToolbarTheme() {
  const channel = React.useMemo(() => {
    try {
      return addons.getChannel();
    } catch {
      return undefined;
    }
  }, []);
  const [theme, setTheme] = React.useState<'light' | 'dark'>(() => (document.documentElement.classList.contains('dark') ? 'dark' : 'light'));

  React.useEffect(() => {
    if (!channel) return;
    const onUpdated = ({ globals }: { globals?: { theme?: string } }) => setTheme(globals?.theme === 'dark' ? 'dark' : 'light');
    channel.on(GLOBALS_UPDATED, onUpdated);
    return () => channel.off(GLOBALS_UPDATED, onUpdated);
  }, [channel]);

  return {
    theme,
    onThemeChange: (next: 'light' | 'dark') => {
      setTheme(next);
      channel?.emit(UPDATE_GLOBALS, { globals: { theme: next } });
    },
  } as const;
}
