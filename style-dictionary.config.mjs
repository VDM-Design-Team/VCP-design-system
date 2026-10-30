import StyleDictionary from 'style-dictionary';
import { registerGdlFormats, gdlPlatforms, gdlIncludes } from '@vdm-design-team/gdl/build';

/* ------------------------------------------------------------------ *
 * VCP Design System — token build, on GDL (@vdm-design-team/gdl).
 * GDL supplies the shared scales (colour families, spacing, fonts,
 * elevation, the type ramp) and the build formats; tokens/ holds only
 * what is VCP's own: the vcp-blue ramp, the navy brand mark, the UI
 * face, radius/shadow/border names and the semantic colours.
 *
 * Tailwind v4 CSS-first theme: every token path maps onto a Tailwind
 * namespace so it becomes a real utility class.
 *
 * Utility vocabulary (matches Figma variable names):
 *   bg-surface-canvas      text-text-primary      border-stroke-default
 *   bg-action-primary-surface-default   text-accent-critical-outline-content-default
 *   text-label-sm-medium (type ramp)    rounded-md   shadow-menu
 *
 * Spacing: VCP's px scale (2..64) equals Tailwind's default numeric
 * scale (p-1 = 4px ... p-16 = 64px), so we do NOT override spacing —
 * devs use the numbers they already know. See docs/spacing.md.
 * ------------------------------------------------------------------ */

registerGdlFormats(StyleDictionary);

/* theme.css is the stylesheet an app imports, and the app already runs its
 * own Tailwind v4 (`@import "tailwindcss"` first, then this file). GDL's
 * format writes `@import "tailwindcss"` at the top, which would load
 * Tailwind a second time, so VCP's theme swaps that line for an `@source`
 * on the component bundle beside it: the app's Tailwind then generates the
 * components' classes without an @source of its own. Storybook and the
 * preview import Tailwind themselves, the same way an app does. */
const gdlTheme = StyleDictionary.hooks.formats['gdl/tailwind-theme'];
StyleDictionary.registerFormat({
  name: 'vcp/tailwind-theme',
  format: async (args) => {
    const css = await gdlTheme(args);
    const themed = css.replace('@import "tailwindcss";\n', '@source "./index.js";\n');
    if (themed === css) throw new Error('vcp/tailwind-theme: GDL\'s theme no longer starts with @import "tailwindcss" — update this wrapper.');
    return themed;
  },
});

const platforms = gdlPlatforms();
platforms.tailwind.files = platforms.tailwind.files.map((f) =>
  f.destination === 'theme.css' ? { ...f, format: 'vcp/tailwind-theme' } : f,
);

export default {
  include: gdlIncludes(),        // GDL tokens; VCP's win on a collision (font.family.sans)
  source: ['tokens/**/*.json'],
  platforms,
};
