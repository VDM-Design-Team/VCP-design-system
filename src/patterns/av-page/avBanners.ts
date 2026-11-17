import type { BannerProps } from '../../components/banner';

/**
 * The two notices an Added Value page carries when it has been turned down, written once. Figma draws them as the page's `Banner` at the top of the left column:
 * a **critical** one with the reason under it, and a **warning** one with the feedback under it. When the AV was handled in another domain (an Added Value
 * initiated across domains) the headline names it. Pass the result to `AVPage`'s `banner`.
 *
 * **The headlines are ours, not Figma's** (decided 17 November 2026). Figma writes "This Task was rejected" and "Remarks" / "Remarks from Development Domain".
 * Here both say what happened and call it an Added Value, as the dialogs and toasts do: "This Added Value was rejected" and "This Added Value was moved to the
 * backlog", each with "in Development Domain" when another domain did it.
 *
 * `live: 'off'`: a banner on a page is read in document order, and a live region would only announce it a second time as the page loads.
 */
export interface AVBannerOptions {
  /** The reason, or the feedback, as the person who turned it down wrote it. */
  message: React.ReactNode;
  /** The domain that did it, when it is not this page's own ("Development"). */
  domain?: string;
}

/** The Added Value was rejected: a critical banner, "This Added Value was rejected" and the reason. */
export const rejectedBanner = ({ message, domain }: AVBannerOptions): BannerProps => ({
  tone: 'critical',
  title: domain ? `This Added Value was rejected in ${domain} Domain` : 'This Added Value was rejected',
  children: message,
  live: 'off',
});

/** The Added Value was sent back to the backlog: a warning banner, "This Added Value was moved to the backlog" and the feedback. */
export const backloggedBanner = ({ message, domain }: AVBannerOptions): BannerProps => ({
  tone: 'warning',
  title: domain ? `This Added Value was moved to the backlog in ${domain} Domain` : 'This Added Value was moved to the backlog',
  children: message,
  live: 'off',
});
