import * as React from 'react';

/**
 * The small amount of arithmetic every chart shares, so a bar chart and a line chart draw the same axis.
 */

/** A step of 1, 2, 2.5, 3, 5 or 10 times a power of ten: the "nice" gaps between gridlines a person can read. */
const niceStep = (raw: number): number => {
  const exp = Math.floor(Math.log10(raw));
  const base = 10 ** exp;
  const f = raw / base;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 3 ? 3 : f <= 5 ? 5 : 10;
  return nice * base;
};

/**
 * Gridline values for a value axis from 0: `[0, 25, 50, … 175]` for a maximum of 157 and `tickCount` 7. The last tick is at or
 * above the largest value, so nothing is drawn past the top. `tickCount` is a *target*: the steps round to readable numbers.
 * `pinned` makes `max` the top gridline itself (a chart pinned to 200 gets 0, 25 … 200, not a tick past it).
 * No data (or all zeros) gives `[0, 1]` so there is still an axis to draw.
 */
export const niceTicks = (max: number, tickCount = 7, pinned = false): number[] => {
  if (!Number.isFinite(max) || max <= 0) return [0, 1];
  let step = niceStep(max / Math.max(1, tickCount));
  if (pinned) {
    /* A pinned top must itself be a gridline: take the readable step, of those that divide it evenly, nearest the target count. */
    const target = max / Math.max(1, tickCount);
    const exp = Math.floor(Math.log10(target));
    const divides = [-1, 0, 1].flatMap((d) => [1, 2, 2.5, 3, 5, 10].map((m) => m * 10 ** (exp + d))).filter((c) => Math.abs(max / c - Math.round(max / c)) < 1e-9);
    if (divides.length) step = divides.sort((a, b) => Math.abs(max / a - tickCount) - Math.abs(max / b - tickCount))[0]!;
  }
  const top = pinned ? max : Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= top + step / 1000; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
  return ticks;
};

/** A chart's width, kept current as its box is resized (a narrower card, a window drag). 0 until it has been measured. */
export function useElementWidth<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
  const ref = React.useRef<T | null>(null);
  const [width, setWidth] = React.useState(0);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(Math.round(el.getBoundingClientRect().width));
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      const w = Math.round(entries[0]?.contentRect.width ?? el.getBoundingClientRect().width);
      setWidth((prev) => (prev === w ? prev : w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}
