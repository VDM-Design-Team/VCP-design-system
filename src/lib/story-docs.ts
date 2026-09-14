/**
 * Docs-page parameters for a story whose piece covers the whole screen — a
 * dialog, a drawer, anything rendered into `document.body` at `position: fixed`.
 *
 * Storybook's Docs page renders every story of a component into one shared
 * document. A dialog escapes its story's box and covers that whole document,
 * so a component with several open stories draws all its dialogs on top of
 * each other, each with its own backdrop, each marking the rest of the page
 * inert and trapping focus against the others (found 14 September 2026).
 *
 * `inline: false` gives each story its own iframe on the Docs page. A
 * full-screen dialog then covers only its frame. The story's own canvas and
 * Chromatic are unaffected — they already render one story per iframe.
 *
 * Spread into the meta: `parameters: { docs: { story: OVERLAY_DOCS_STORY } }`.
 */
export const OVERLAY_DOCS_STORY = {
  inline: false,
  /* An iframe does not size to its content, so the frame needs a height. Tall
     enough for the largest AV dialog; longer bodies scroll inside the panel,
     as they do on a real screen. */
  height: '720px', // ds-lint-ignore
} as const;
