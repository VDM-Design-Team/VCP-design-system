/**
 * Story parameters for a side-by-side story — one that renders two or more
 * copies of a piece that is itself a landmark (a header, a footer, a nav, a
 * whole page) so the reader can compare them. axe reads that as one document
 * with two banners, and it is right; the duplication is the story's doing,
 * not the piece's. Spread this into the story's `parameters` and the
 * landmark-uniqueness rules stand down for that story only. Every other rule
 * still runs.
 */
export const SIDE_BY_SIDE = {
  a11y: {
    config: {
      rules: [
        { id: 'landmark-no-duplicate-banner', enabled: false },
        { id: 'landmark-no-duplicate-contentinfo', enabled: false },
        { id: 'landmark-no-duplicate-main', enabled: false },
        { id: 'landmark-one-main', enabled: false },
        { id: 'landmark-unique', enabled: false },
      ],
    },
  },
} as const;
