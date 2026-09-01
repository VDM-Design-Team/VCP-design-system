import * as React from 'react';
import { createPortal } from 'react-dom';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import { IconButton } from '../icon-button';

/**
 * Modal — a centred dialog over a dimmed backdrop.
 *
 * The visual part of this component is the easy half. The half that matters is
 * the focus contract, because a dialog that gets it wrong either traps a
 * keyboard user with no way out or strands them behind the backdrop with no way
 * in. The contract is spelled out in full in `docs/modal.md`; in short:
 *
 *   open   → remember what had focus, move focus into the panel, make everything
 *            behind it inert, lock the page scroll without shifting the layout
 *   while  → Tab and Shift+Tab cycle inside the panel and never leave it
 *   close  → Escape always works, the background comes back, and focus returns
 *            to whatever opened the dialog
 *
 * It renders through a portal to `document.body`, so no ancestor's
 * `overflow: hidden` can clip it and the backdrop always covers the viewport.
 * Nothing touches `document` during render, so it is safe to import on a server.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
const backdrop = cva([
  /* Covers the viewport from the portal, above every page-level surface. */
  'fixed inset-0 z-50',
  'grid place-items-center',
  /* surface.overlay — the system's own scrim. It flips in dark for free. */
  'bg-surface-overlay p-6',
]);

const panel = cva(
  [
    'relative flex w-full flex-col',
    /* The panel never exceeds its grid area, and the body scrolls inside it. */
    'max-h-full min-h-0 overflow-hidden',
    'rounded-md bg-surface-elevated shadow-modal',
    /* The panel owns its body colour so it reads correctly in dark on its own. */
    'font-sans text-text-secondary',
    /* Focus lands here programmatically, never by Tab, so a ring would be noise
       on a container the user cannot navigate to. Every control inside keeps its
       own `focus-visible` ring. */
    'focus:outline-none',
  ],
  {
    variants: {
      /* Widths on Tailwind's numeric spacing scale: 384 / 512 / 640 / 800. */
      size: {
        sm: 'max-w-96',
        md: 'max-w-128',
        lg: 'max-w-160',
        xl: 'max-w-200',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

const header = cva('flex shrink-0 items-start gap-3 px-6 pt-5', {
  variants: {
    /* With no heading text the close button is the only child, so it hugs the
       right edge rather than sitting alone on the left. */
    hasText: { true: '', false: 'justify-end' },
  },
  defaultVariants: { hasText: true },
});

/* ------------------------------------------------------------------ */
/* Scroll lock                                                         */
/* ------------------------------------------------------------------ */

/**
 * Module-level, and counted. Two dialogs opening in sequence (or a second one
 * opening while the first is still unmounting, which React does routinely in
 * StrictMode) must not leak the lock: the original inline styles are captured
 * on the 0 → 1 transition and restored only on the 1 → 0 one.
 */
let lockCount = 0;
let savedBodyStyle: { overflow: string; paddingRight: string } | null = null;

function lockScroll() {
  lockCount += 1;
  if (lockCount > 1) return;

  const body = document.body;
  savedBodyStyle = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };

  /* Hiding the scrollbar reclaims its width and everything on the page jumps
     left. Give the width straight back as padding so the layout does not move. */
  const gutter = window.innerWidth - document.documentElement.clientWidth;
  const current = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;

  body.style.overflow = 'hidden';
  if (gutter > 0) body.style.paddingRight = `${current + gutter}px`;
}

function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0 || !savedBodyStyle) return;

  document.body.style.overflow = savedBodyStyle.overflow;
  document.body.style.paddingRight = savedBodyStyle.paddingRight;
  savedBodyStyle = null;
}

/* ------------------------------------------------------------------ */
/* Background inertness                                                */
/* ------------------------------------------------------------------ */

/** Marks a node this dialog hid, so an inner dialog does not un-hide it. */
const INERT_MARK = 'data-vcp-modal-inert';

/** Nodes that carry no content and are pointless to hide. */
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'LINK', 'TEMPLATE', 'NOSCRIPT']);

/**
 * Makes everything behind the dialog inert to pointer, keyboard and assistive
 * tech, and returns the undo.
 *
 * `inert` is the right tool: per spec an inert subtree is removed from the
 * accessibility tree *and* from the focus order, so one attribute covers both.
 * `aria-hidden` alone would leave the background tabbable, and combining the two
 * trips axe's `aria-hidden-focus` rule the moment the background contains a
 * focusable element — which it always does, because the trigger is out there.
 * Where `inert` is unsupported we fall back to `aria-hidden` and lean on the
 * focus trap to keep the keyboard in.
 */
function hideBackground(portalEl: HTMLElement): () => void {
  const supportsInert = 'inert' in HTMLElement.prototype;
  const changed: { el: HTMLElement; hadInert: boolean; ariaHidden: string | null }[] = [];

  for (const node of Array.from(document.body.children)) {
    if (!(node instanceof HTMLElement)) continue;
    /* Never hide our own portal, and never touch what an outer dialog owns. */
    if (node === portalEl || node.hasAttribute(INERT_MARK)) continue;
    if (SKIP_TAGS.has(node.tagName)) continue;

    changed.push({
      el: node,
      hadInert: node.hasAttribute('inert'),
      ariaHidden: node.getAttribute('aria-hidden'),
    });

    node.setAttribute(INERT_MARK, '');
    if (supportsInert) node.setAttribute('inert', '');
    else node.setAttribute('aria-hidden', 'true');
  }

  return () => {
    for (const { el, hadInert, ariaHidden } of changed) {
      el.removeAttribute(INERT_MARK);
      if (!hadInert) el.removeAttribute('inert');
      if (ariaHidden === null) el.removeAttribute('aria-hidden');
      else el.setAttribute('aria-hidden', ariaHidden);
    }
  };
}

/* ------------------------------------------------------------------ */
/* Focus trap                                                          */
/* ------------------------------------------------------------------ */

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button',
  'input',
  'select',
  'textarea',
  'iframe',
  'object',
  'embed',
  'summary',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',');

/**
 * The panel's tabbable elements, in document order, computed fresh on every Tab
 * so content that appears while the dialog is open is trapped too.
 */
function getFocusable(root: HTMLElement): HTMLElement[] {
  const candidates = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => {
      if (el.hasAttribute('inert') || el.closest('[inert]')) return false;
      if (el.getAttribute('aria-hidden') === 'true') return false;
      if ((el as HTMLInputElement).disabled) return false;
      if (el.hidden || el.tabIndex < 0) return false;
      /* Zero boxes are display:none, visibility:hidden or type="hidden". */
      return el.getClientRects().length > 0;
    },
  );

  /* A radio group is one stop, not one stop per radio: only the checked radio
     is tabbable, or the first when none is. Getting this wrong makes the wrap
     fire on the wrong element. */
  const seenGroups = new Set<string>();
  return candidates.filter((el) => {
    if (!(el instanceof HTMLInputElement) || el.type !== 'radio' || !el.name) return true;
    if (seenGroups.has(el.name)) return false;

    const scope: ParentNode = el.form ?? root;
    const group = Array.from(
      scope.querySelectorAll<HTMLInputElement>(
        `input[type="radio"][name="${CSS.escape(el.name)}"]`,
      ),
    );
    const tabbable = group.find((radio) => radio.checked) ?? group[0];
    if (el !== tabbable) return false;

    seenGroups.add(el.name);
    return true;
  });
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

interface ModalBaseProps
  extends Omit<
      React.HTMLAttributes<HTMLDivElement>,
      /* `title` is our rendered heading, not the native tooltip string.
         `role`, `aria-modal`, `aria-label` and `aria-labelledby` are the
         dialog's identity and are not the caller's to overwrite by accident. */
      'title' | 'role' | 'aria-modal' | 'aria-label' | 'aria-labelledby'
    >,
    VariantProps<typeof panel> {
  /** Whether the dialog is rendered. Nothing is portalled while `false`. */
  open: boolean;
  /**
   * Asked to close. Fires on Escape, on the close button, and on a backdrop
   * click when `dismissible`. The dialog never closes itself — you own `open`.
   */
  onClose: () => void;
  /** Sub-heading under the title. Wired to `aria-describedby`. */
  description?: React.ReactNode;
  /** Right-aligned action row at the bottom. Usually two `Button`s. */
  footer?: React.ReactNode;
  /**
   * `alertdialog` for a destructive confirmation the user must answer. It makes
   * screen readers announce the description immediately, so give one.
   */
  role?: 'dialog' | 'alertdialog';
  /** A stray click on the backdrop closes it. Set `false` for confirmations. */
  dismissible?: boolean;
  /** Renders the icon-only close button in the header. */
  showClose?: boolean;
  /** Accessible name for the close button. */
  closeLabel?: string;
  /** Where focus goes on open. Defaults to the panel — see `docs/modal.md`. */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  /** Where focus goes on close. Defaults to whatever had it when it opened. */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
  /** Merged onto the scrolling body wrapper. The escape hatch for body layout. */
  bodyClassName?: string;
  children?: React.ReactNode;
}

/**
 * A dialog must have an accessible name, and this is the single most common
 * failure in the category. The type system makes it unskippable: either you pass
 * a visible `title` (which becomes `aria-labelledby`) or you pass `aria-label`.
 * There is no third option and no unnamed Modal.
 */
type ModalNameProps =
  | { title: React.ReactNode; 'aria-label'?: string }
  | { title?: undefined; 'aria-label': string };

export type ModalProps = ModalBaseProps & ModalNameProps;

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(function Modal(
  {
    className,
    bodyClassName,
    open,
    onClose,
    title,
    description,
    footer,
    size,
    role = 'dialog',
    dismissible = true,
    showClose = true,
    closeLabel = 'Close',
    initialFocusRef,
    returnFocusRef,
    'aria-label': ariaLabel,
    'aria-describedby': describedBy,
    children,
    ...props
  },
  ref,
) {
  /* SSR-safe: `document` is never read during render, only after mount. */
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  /* Every hook runs before the `open` early-return, so the order is stable. */
  const generatedId = React.useId();
  const titleId = `${generatedId}-title`;
  const descriptionId = `${generatedId}-description`;

  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const portalRef = React.useRef<HTMLDivElement | null>(null);
  const bodyRef = React.useRef<HTMLDivElement | null>(null);
  /* A scrolling region has to be operable from the keyboard (WCAG 2.1.1). When
     the body overflows it becomes a tab stop so it can be scrolled with the
     arrow keys; when it does not, it stays out of the tab order rather than
     adding a stop that does nothing. */
  const [scrollable, setScrollable] = React.useState(false);
  /* Tracks whether the pointer went *down* on the backdrop, so a drag that
     starts inside the panel and ends outside it does not close the dialog. */
  const pointerDownOnBackdrop = React.useRef(false);

  /* The open/close effect must not re-run when a caller passes a fresh arrow
     function each render, so the live values are read through a ref that is
     refreshed before that effect runs. */
  const latest = React.useRef({ onClose, initialFocusRef, returnFocusRef });
  React.useEffect(() => {
    latest.current = { onClose, initialFocusRef, returnFocusRef };
  });

  React.useEffect(() => {
    if (!open || !mounted) return;
    const bodyEl = bodyRef.current;
    if (!bodyEl) return;

    const measure = () => setScrollable(bodyEl.scrollHeight > bodyEl.clientHeight + 1);
    measure();

    /* The box changes when the viewport does; the content changes on its own. */
    const observer = new ResizeObserver(measure);
    observer.observe(bodyEl);
    for (const child of Array.from(bodyEl.children)) observer.observe(child);
    return () => observer.disconnect();
  }, [open, mounted, children]);

  React.useEffect(() => {
    if (!open || !mounted) return;
    const panelEl = panelRef.current;
    const portalEl = portalRef.current;
    if (!panelEl || !portalEl) return;

    /* 1. Remember the trigger before anything can steal focus from it. */
    const active = document.activeElement;
    const trigger =
      latest.current.returnFocusRef?.current ??
      (active instanceof HTMLElement ? active : null);

    /* 2. Everything behind goes inert, and the page stops scrolling. */
    const restoreBackground = hideBackground(portalEl);
    lockScroll();

    /* 3. Focus moves in. The panel itself by default — see docs/modal.md. */
    (latest.current.initialFocusRef?.current ?? panelEl).focus({ preventScroll: true });

    /* 4. The trap. On `document`, in the capture phase, so it still works if
       focus somehow ends up outside the panel — a listener bound to the panel
       would simply never fire in that case, which is the exact moment a trap is
       supposed to earn its keep. */
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        latest.current.onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const items = getFocusable(panelEl);
      const current = document.activeElement;

      /* Nothing to tab to: keep focus on the panel rather than let it escape. */
      if (items.length === 0) {
        event.preventDefault();
        panelEl.focus({ preventScroll: true });
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const inside = current instanceof Node && panelEl.contains(current);

      if (event.shiftKey) {
        /* Backwards off the front — or from the panel, whose "previous" is
           outside — wraps to the last. */
        if (!inside || current === first || current === panelEl) {
          event.preventDefault();
          last.focus();
        }
      } else if (!inside || current === last) {
        /* Forwards off the end wraps to the first. Forwards *from the panel*
           is left alone: the browser already lands on the first element. */
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      unlockScroll();
      /* Background comes back before focus does, so the trigger is focusable
         again by the time we reach for it. */
      restoreBackground();
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [open, mounted]);

  if (!open || !mounted) return null;

  const hasTitle = title !== undefined && title !== null && title !== false;
  const hasDescription = description !== undefined && description !== null && description !== false;
  const hasHeaderText = hasTitle || hasDescription;

  return createPortal(
    <div
      ref={portalRef}
      className={backdrop()}
      onPointerDown={(event) => {
        pointerDownOnBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget || !pointerDownOnBackdrop.current) return;
        pointerDownOnBackdrop.current = false;
        if (dismissible) onClose();
        /* Not dismissible: the click blurred whatever had focus, so put it
           back inside rather than leave the user parked on <body>. */
        else panelRef.current?.focus({ preventScroll: true });
      }}
    >
      <div
        {...props}
        ref={(node) => {
          panelRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        role={role}
        aria-modal="true"
        aria-labelledby={hasTitle ? titleId : undefined}
        aria-label={hasTitle ? undefined : ariaLabel}
        aria-describedby={
          [hasDescription ? descriptionId : null, describedBy].filter(Boolean).join(' ') ||
          undefined
        }
        tabIndex={-1}
        className={cn(panel({ size }), className)}
      >
        {(hasHeaderText || showClose) && (
          <header className={header({ hasText: hasHeaderText })}>
            {hasHeaderText && (
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                {hasTitle && (
                  <h2 id={titleId} className="text-heading-md text-text-primary">
                    {title}
                  </h2>
                )}
                {hasDescription && (
                  <p id={descriptionId} className="text-body-sm text-text-tertiary">
                    {description}
                  </p>
                )}
              </div>
            )}
            {showClose && (
              <IconButton
                icon="x"
                label={closeLabel}
                variant="tertiary"
                /* Pulled back into the header's padding so the 40 target sits
                   optically level with the title without inflating the header. */
                className="-mt-2 -mr-2"
                onClick={onClose}
              />
            )}
          </header>
        )}

        <div
          ref={bodyRef}
          /* Only a tab stop while it actually scrolls — see `scrollable`. */
          tabIndex={scrollable ? 0 : undefined}
          className={cn(
            'min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5',
            'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-stroke-focused',
            bodyClassName,
          )}
        >
          {children}
        </div>

        {footer && (
          <footer className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-stroke-default bg-surface-canvas px-6 py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
});
