import { Extension } from '@tiptap/react';
import type { Node as PMNode } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

/** How many words, counting the one the initial starts, go in small caps. */
const SMALL_CAPS_WORDS = 3;
const CAPS = new RegExp(`^\\S*(?:\\s+\\S+){0,${SMALL_CAPS_WORDS - 1}}`, 'u');

/**
 * Where the initial and the small caps go: the first letter of the body,
 * if the body opens with a paragraph that starts with a letter or a digit.
 * Positions are ProseMirror document positions.
 */
export function illuminatedRange(doc: PMNode): { initial: [number, number]; caps: [number, number] | null } | null {
  const first = doc.firstChild;
  if (!first || first.type.name !== 'paragraph') return null;
  // Only the leading run of plain text counts: a mark or a break ends it.
  const lead = first.firstChild;
  if (!lead?.isText || !lead.text) return null;
  const text = lead.text;
  if (!/^[\p{L}\p{N}]/u.test(text)) return null;
  // Paragraph content starts one position inside the paragraph, which starts at 0.
  const start = 1;
  const initial: [number, number] = [start, start + 1];
  // The rest of the first word plus the next ones, up to SMALL_CAPS_WORDS words in all.
  const len = CAPS.exec(text.slice(1))?.[0].length ?? 0;
  return { initial, caps: len > 0 ? [start + 1, start + 1 + len] : null };
}

const key = new PluginKey('illuminated');

/**
 * The illuminated initial (board 4.3): the body's first letter as a gold-leaf
 * square with an oxblood capital, then a few words in small caps. Drawn with
 * decorations, so it comes from the text and is never stored.
 */
export const Illuminated = Extension.create({
  name: 'illuminated',
  addProseMirrorPlugins() {
    const build = (doc: PMNode) => {
      const r = illuminatedRange(doc);
      if (!r) return DecorationSet.empty;
      const decos = [Decoration.inline(r.initial[0], r.initial[1], { class: 'illuminated-initial' })];
      if (r.caps) decos.push(Decoration.inline(r.caps[0], r.caps[1], { class: 'illuminated-caps' }));
      return DecorationSet.create(doc, decos);
    };
    return [
      new Plugin({
        key,
        state: {
          init: (_, { doc }) => build(doc),
          apply: (tr, old) => (tr.docChanged ? build(tr.doc) : old),
        },
        props: {
          decorations: (state) => key.getState(state),
        },
      }),
    ];
  },
});
