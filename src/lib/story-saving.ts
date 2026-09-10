import * as React from 'react';
import type { SavingStatus } from './saving';

/**
 * The parent's half of the saving contract, for stories and their tests: keep
 * the previous value, start the save, move `status` along with it, return to
 * idle after a beat, and on failure put the previous value back and produce a
 * message for `Field`. Every `SaveSucceeds` / `SaveFails` story is this hook
 * around a control — the control itself times nothing and reverts nothing.
 */
export function useFakeSave<T>(
  initial: T,
  outcome: 'resolve' | 'reject',
  { delay = 300, settleAfter = 1500 }: { delay?: number; settleAfter?: number } = {},
) {
  const [value, setValue] = React.useState(initial);
  const [status, setStatus] = React.useState<SavingStatus>('idle');
  const [error, setError] = React.useState<string>();
  const settle = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  React.useEffect(() => () => clearTimeout(settle.current), []);

  const save = async (next: T) => {
    const previous = value;
    setValue(next);
    setStatus('pending');
    setError(undefined);
    try {
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => (outcome === 'resolve' ? resolve() : reject(new Error('offline'))), delay);
      });
      setStatus('success');
      settle.current = setTimeout(() => setStatus('idle'), settleAfter);
    } catch {
      setValue(previous);
      setStatus('error');
      setError('Couldn’t save. Try again.');
    }
  };

  return { value, status, error, save };
}
