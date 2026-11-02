/**
 * The house's own axe rule, run with axe's on every story (`a11y.test: 'error'` in
 * .storybook/preview.ts): **a description must not repeat the name.** A tooltip describes its
 * trigger (`aria-describedby`), so a trigger already named by the tooltip's words is heard twice:
 * "John Doe (Assignee, Busy), image, John Doe (Assignee, Busy)" (PR 231), "Initiator: Marvin Reed,
 * image, Marvin Reed" (PR 238). It fails when the description is empty of anything new: the same as
 * the name, or contained in it. Pass `describe={false}` to the `Tooltip`, or say something the name
 * does not.
 */
type AxeLike = {
  commons: {
    text: {
      accessibleTextVirtual: (node: unknown) => string;
      accessibleText: (el: Element, context: { inLabelledByContext: boolean }) => string;
    };
  };
};

const norm = (text: string) => text.replace(/\s+/g, ' ').trim().toLowerCase();

export const DESCRIPTION_REPEATS_NAME = {
  checks: [
    {
      id: 'vcp-description-adds-something',
      evaluate(node: Element, _options: unknown, virtualNode: unknown) {
        const axe = (window as unknown as { axe: AxeLike }).axe;
        const name = norm(axe.commons.text.accessibleTextVirtual(virtualNode));
        const description = norm(
          (node.getAttribute('aria-describedby') ?? '')
            .split(/\s+/)
            .filter(Boolean)
            .map((id) => node.ownerDocument.getElementById(id))
            .map((el) => (el ? axe.commons.text.accessibleText(el, { inLabelledByContext: true }) : ''))
            .join(' '),
        );
        return !name || !description || !name.includes(description);
      },
    },
  ],
  rules: [
    {
      id: 'vcp-description-repeats-name',
      selector: '[aria-describedby]',
      any: ['vcp-description-adds-something'],
      impact: 'moderate',
      tags: ['vcp'],
      metadata: {
        description: 'A description (aria-describedby) must say something its element’s name does not',
        help:
          'The description repeats the name, so it is heard twice. On a Tooltip whose trigger is already ' +
          'named by its words, pass describe={false}.',
      },
    },
  ],
};

/** The a11y config every story runs with; a story that sets its own `a11y.config` spreads this in. */
export const A11Y_CONFIG = { checks: DESCRIPTION_REPEATS_NAME.checks, rules: DESCRIPTION_REPEATS_NAME.rules };

/**
 * Story parameters for a side-by-side story — one that renders two or more
 * copies of a piece that is itself a landmark (a header, a footer, a nav, a
 * whole page) so the reader can compare them. axe reads that as one document
 * with two banners, and it is right; the duplication is the story's doing,
 * not the piece's. Spread this into the story's `parameters` and the
 * landmark-uniqueness rules stand down for that story only. Every other rule
 * still runs (the house rule above included: a story's `rules` replace the
 * preview's, so they are restated here).
 */
export const SIDE_BY_SIDE = {
  a11y: {
    config: {
      checks: A11Y_CONFIG.checks,
      rules: [
        ...A11Y_CONFIG.rules,
        { id: 'landmark-no-duplicate-banner', enabled: false },
        { id: 'landmark-no-duplicate-contentinfo', enabled: false },
        { id: 'landmark-no-duplicate-main', enabled: false },
        { id: 'landmark-one-main', enabled: false },
        { id: 'landmark-unique', enabled: false },
      ],
    },
  },
} as const;
