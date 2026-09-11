/**
 * Where a save of a control's current value stands. The parent owns it; the
 * control only shows it. `idle` is the everyday state and every control's
 * default. The full contract — who times what, who reverts what, who owns the
 * message — is docs/saving-states.md.
 */
export type SavingStatus = 'idle' | 'pending' | 'success' | 'error';
