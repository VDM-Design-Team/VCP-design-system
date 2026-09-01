import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * VCP's type ramp. These are `text-*` utilities that set *size* (plus line-height,
 * weight and tracking, which come as a unit from `type.*`), not colour.
 *
 * tailwind-merge cannot tell them apart from colour utilities on its own: out of
 * the box it files any unrecognised `text-…` under the colour group, so
 * `text-label-lg` and `text-text-primary` look like the same property and the
 * earlier one is silently dropped. Declaring the ramp here puts it in the
 * font-size group where it belongs.
 *
 * Keep in step with `tokens/semantic/type.json` — `npm run lint:tokens` fails if
 * this list and the tokens drift apart.
 */
const TYPE_RAMP = [
  'display-xl',
  'display-lg',
  'display-md',
  'heading-lg',
  'heading-md',
  'heading-sm',
  'title-sm',
  'body-lg',
  'body-md',
  'body-sm',
  'label-lg',
  'label-md',
  'label-sm',
  'caption-md',
  'caption-sm',
] as const;

const twMerge = extendTailwindMerge({
  extend: { classGroups: { 'font-size': [{ text: [...TYPE_RAMP] }] } },
});

/** Merge Tailwind classes safely — later classes win on conflict. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
