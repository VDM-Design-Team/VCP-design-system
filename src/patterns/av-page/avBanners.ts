import type { BannerProps } from '../../components/banner';

/**
 * The two notices an Added Value page carries when it has been turned down, written once. Figma draws them as the page's `Banner` at the top of the left column:
 * a **critical** one, "This Task was rejected", with the reason under it, and a **warning** one, "Remarks", with the feedback under it. When the AV was handled
 * in another domain (an Added Value initiated across domains) the headline names it: "This Task was rejected in Development Domain", "Remarks from Development
 * Domain". Pass the result to `AVPage`'s `banner`.
 *
 * `live: 'off'`: a banner on a page is read in document order, and a live region would only announce it a second time as the page loads.
 */
export interface AVBannerOptions {
  /** The reason, or the feedback, as the person who turned it down wrote it. */
  message: React.ReactNode;
  /** The domain that did it, when it is not this page's own ("Development"). */
  domain?: string;
}

/** The Added Value was rejected: a critical banner, "This Task was rejected" and the reason. */
export const rejectedBanner = ({ message, domain }: AVBannerOptions): BannerProps => ({
  tone: 'critical',
  title: domain ? `This Task was rejected in ${domain} Domain` : 'This Task was rejected',
  children: message,
  live: 'off',
});

/** The Added Value was sent back to the backlog: a warning banner, "Remarks" and the feedback. */
export const backloggedBanner = ({ message, domain }: AVBannerOptions): BannerProps => ({
  tone: 'warning',
  title: domain ? `Remarks from ${domain} Domain` : 'Remarks',
  children: message,
  live: 'off',
});
