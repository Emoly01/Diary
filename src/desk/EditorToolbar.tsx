import { useEditorState, type Editor } from '@tiptap/react';
import type { ReactNode } from 'react';

const icon = (children: ReactNode) => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const ICONS = {
  bold: icon(<path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z" />),
  italic: icon(<path d="M14 5h-4M14 19h-4M14 5l-4 14" />),
  heading: icon(<path d="M6 5v14M18 5v14M6 12h12" />),
  bullets: icon(<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" />),
  numbers: icon(<path d="M10 6h10M10 12h10M10 18h10M4 5h1.5v4M4 9h3M4 15.5c0-1 2.5-1 2.5.3 0 .9-2.5 2-2.5 3.2h2.7" />),
};

/** Bold, italic, a heading and two kinds of list. That's StarterKit, used sparingly. */
export default function EditorToolbar({ editor }: { editor: Editor }) {
  const active = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      heading: e.isActive('heading', { level: 2 }),
      bullets: e.isActive('bulletList'),
      numbers: e.isActive('orderedList'),
    }),
  });

  const buttons: { key: keyof typeof ICONS; label: string; run: () => void }[] = [
    { key: 'bold', label: 'Bold', run: () => editor.chain().focus().toggleBold().run() },
    { key: 'italic', label: 'Italic', run: () => editor.chain().focus().toggleItalic().run() },
    { key: 'heading', label: 'Heading', run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { key: 'bullets', label: 'Bulleted list', run: () => editor.chain().focus().toggleBulletList().run() },
    { key: 'numbers', label: 'Numbered list', run: () => editor.chain().focus().toggleOrderedList().run() },
  ];

  return (
    <div className="editor-toolbar" role="toolbar" aria-label="Formatting">
      {buttons.map((b) => (
        <button
          key={b.key}
          type="button"
          className="editor-tool"
          aria-label={b.label}
          aria-pressed={active[b.key]}
          // Keep the editor's selection when the button is pressed.
          onMouseDown={(e) => e.preventDefault()}
          onClick={b.run}
        >
          {ICONS[b.key]}
        </button>
      ))}
    </div>
  );
}
