import * as React from 'react';
export interface MarketingHeroProps {
  /** Small uppercase kicker above the title. */
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  body?: React.ReactNode;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  /** Screenshot or image beside the copy (ignored when centred). */
  media?: React.ReactNode;
  align?: 'left' | 'center';
  style?: React.CSSProperties;
}
export declare function MarketingHero(props: MarketingHeroProps): JSX.Element;