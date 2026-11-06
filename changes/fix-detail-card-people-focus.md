---
bump: patch
---
### `DetailCard`: focus no longer drops when adding, editing or removing a person (November 2026)

Opening the add form disabled the + that had focus, so focus fell to the page. Now focus goes into the form's "Select user" field; Cancel or Add puts it back on the +; Cancel or Save on an edit puts it on that chip's pencil; removing a chip moves it to the next chip's pencil, or to the + when it was the last. The chips' pencil and ✕ are named for the person ("Edit Jane Doe", "Remove Jane Doe"). `EditingPeople` asserts it.
