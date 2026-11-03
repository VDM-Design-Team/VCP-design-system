import * as React from 'react';
import { cn } from '../../lib/cn';
import { IconButton } from '../../atoms/icon-button';
import { Input, type InputProps } from '../../atoms/input';

/**
 * PasswordField — a password `Input` with the eye at its end that shows what you typed. Built to Figma's `_Password_Show_Hide_Icon`
 * (`State=Show` / `State=Hide`) in the Password settings items.
 *
 * It is `Input` with its `trailingAction`: the toggle is a real button inside the field's border and ring, so it is reachable by keyboard
 * and named for what it does. **The field is a password field until the eye is pressed** (`type="password"`, the dots), then plain text.
 * The eye is a toggle: its name is always "Show password" and `aria-pressed` says whether the password is showing — one name, not two,
 * so a screen reader hears "Show password, pressed" rather than a label that flips under it.
 *
 * It takes everything `Input` does (so `Field` can wire its `id`, `aria-describedby` and `aria-invalid` onto it) except `type`. Set
 * `autoComplete="new-password"` on a field where a new password is chosen and `current-password` where the existing one is entered, so a
 * password manager does the right thing.
 *
 * `visible` / `onVisibleChange` control the eye from outside (to show or hide several fields together); left out, it keeps its own state.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the token in
 * `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface PasswordFieldProps extends Omit<InputProps, 'type' | 'trailingAction' | 'trailingIcon'> {
  /** Whether the password is showing. Controlled; left out, the field keeps its own. */
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  /** The eye's accessible name. */
  toggleLabel?: string;
}

export const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ visible, onVisibleChange, toggleLabel = 'Show password', disabled, className, ...props }, ref) => {
    const [own, setOwn] = React.useState(false);
    const shown = visible ?? own;
    return (
      <Input
        ref={ref}
        {...props}
        type={shown ? 'text' : 'password'}
        disabled={disabled}
        className={cn(className)}
        trailingAction={
          <IconButton
            type="button"
            size="xs"
            icon={shown ? 'eye-slash' : 'eye'}
            label={toggleLabel}
            aria-pressed={shown}
            disabled={disabled}
            /* A 24 glyph button with a 40 press area, as `PageTitle`'s does: the field is 40 high, the control inside it need not be.
               Grey, not brand blue: it sits inside the field, so it should not read as a call to action. */
            className="relative text-neutral-outline-content-default hover:text-neutral-outline-content-hover active:text-neutral-outline-content-pressed disabled:text-neutral-outline-content-disabled after:absolute after:-inset-2"
            onClick={() => {
              setOwn(!shown);
              onVisibleChange?.(!shown);
            }}
          />
        }
      />
    );
  },
);
PasswordField.displayName = 'PasswordField';
