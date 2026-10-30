import { userEvent } from 'storybook/test';

/**
 * Typing into a `contenteditable="plaintext-only"` field (`MentionInput`) from a story.
 *
 * user-event does not recognise that value as editable, so its `type` and Backspace do nothing
 * to such a field. These put characters in the way the browser's own typing does, through
 * `execCommand`, which fires the same `beforeinput` and `input` events the field listens to.
 * Arrow keys, Enter and Escape still go through `userEvent.keyboard`: those are the field's own
 * keydown handling and do not depend on editability.
 */
export async function typeText(field: HTMLElement, text: string) {
  await userEvent.click(field);
  for (const char of text) {
    document.execCommand('insertText', false, char);
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}

/** One Backspace in the focused plain-text field. */
export const deleteBack = () => document.execCommand('delete');
