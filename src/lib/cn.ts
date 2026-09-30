import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * VCP's type ramp. These are `text-*` utilities that set *size* (plus line-height,
 * weight and tracking, which come as a unit from `type.*`), not colour.
 *
 * tailwind-merge cannot tell them apart from colour utilities on its own: out of
 * the box it files any unrecognised `text-…` under the colour group, so
 * `text-label-sm-medium` and `text-text-primary` look like the same property and the
 * earlier one is silently dropped. Declaring the ramp here puts it in the
 * font-size group where it belongs.
 *
 * Keep in step with `tokens/semantic/type.json` — `npm run lint:tokens` fails if
 * this list and the tokens drift apart.
 */
const TYPE_RAMP = [
  'display-xl-bold',
  'display-xl-semibold',
  'display-lg-bold',
  'display-lg-semibold',
  'display-md-bold',
  'display-md-semibold',
  'heading-xl-bold',
  'heading-xl-semibold',
  'heading-xl-regular',
  'heading-lg-bold',
  'heading-lg-semibold',
  'heading-lg-regular',
  'heading-md-bold',
  'title-md-bold',
  'title-md-semibold',
  'title-md-regular',
  'title-sm-bold',
  'title-sm-semibold',
  'title-sm-medium',
  'title-sm-regular',
  'body-lg-bold',
  'body-lg-semibold',
  'body-lg-medium',
  'body-lg-regular',
  'body-md-bold',
  'body-md-semibold',
  'body-md-medium',
  'body-md-regular',
  'body-sm-bold',
  'body-sm-semibold',
  'body-sm-medium',
  'body-sm-regular',
  'label-md-semibold',
  'label-md-medium',
  'label-md-regular',
  'label-sm-bold',
  'label-sm-semibold',
  'label-sm-medium',
  'label-sm-regular',
  'caption-md-bold',
  'caption-md-semibold',
  'caption-md-medium',
  'caption-md-regular',
  'caption-sm-bold',
  'caption-sm-semibold',
  'caption-sm-medium',
  'caption-sm-regular',
] as const;

const twMerge = extendTailwindMerge({
  extend: { classGroups: { 'font-size': [{ text: [...TYPE_RAMP] }] } },
});

/** Merge Tailwind classes safely — later classes win on conflict. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
