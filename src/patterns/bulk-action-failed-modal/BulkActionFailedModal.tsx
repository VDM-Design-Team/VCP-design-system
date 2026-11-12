import * as React from 'react';
import { Icon } from '../../atoms/icon';
import { Modal, ModalConfirm } from '../../components/modal';

/**
 * BulkActionFailedModal — when some of a bulk change did not go through: **"Added Values Failed to Update"**, "2 of 5 added values failed to update Urgency to High", then each
 * one that failed with **why** in red, and **Got it**. Built to Figma's `Bulk_Action_Failed_Update_Summary_Popup`.
 *
 * It names *which* AVs and *why* (the note on the design is "Which AVs and Why"), so a person can fix them rather than guess. The ones that worked are not listed: the success
 * toast already said so.
 *
 * **It does nothing itself**: `onClose` is Got it and the ✕. The reasons are the server's words, passed in.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface BulkActionFailure {
  /** "VCP-12345". */
  ref: string;
  title: string;
  /** Where the Added Value is. Given, the reference is a blue link that opens it in a new tab; without one it is plain grey text. */
  href?: string;
  /** Why it failed, in the server's words. */
  reason: string;
}

export interface BulkActionFailedModalProps {
  open: boolean;
  onClose: () => void;
  /** How many were in the change. */
  total: number;
  /** What was being changed: "Urgency". */
  property: string;
  /** What to: "High". */
  value: string;
  failures: readonly BulkActionFailure[];
}

export function BulkActionFailedModal({ open, onClose, total, property, value, failures }: BulkActionFailedModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Added Values Failed to Update"
      description={`${failures.length} of ${total} added values failed to update ${property} to ${value}`}
      size="lg"
      footer={
        <ModalConfirm onClick={onClose}>Got it</ModalConfirm>
      }
    >
      <ul className="m-0 flex list-none flex-col gap-6 p-0 font-sans">
        {failures.map((failure) => (
          <li key={failure.ref} className="flex min-w-0 flex-col gap-1">
            <span className="flex min-w-0 gap-1 text-body-sm-regular">
              {failure.href ? (
                <a
                  href={failure.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-sm text-text-link-default hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused"
                >
                  {failure.ref}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : (
                <span className="shrink-0 text-text-tertiary">{failure.ref}</span>
              )}
              <span className="min-w-0 truncate text-text-primary" title={failure.title}>
                {failure.title}
              </span>
            </span>
            <span className="flex items-center gap-1.5 text-body-sm-regular text-accent-critical-outline-content-default">
              <Icon name="warning-circle-fill" size="sm" aria-hidden="true" className="shrink-0" />
              {failure.reason}
            </span>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
BulkActionFailedModal.displayName = 'BulkActionFailedModal';
