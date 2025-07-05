import { Mark } from '@tiptap/core';

export const Insertion = Mark.create({
  name: 'insertion',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'suggestion-insertion',
      },
    };
  },

  parseHTML() {
    return [{ tag: 'ins' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['ins', { ...this.options.HTMLAttributes, ...HTMLAttributes }, 0];
  },

  addCommands() {
    return {
      setInsertion: () => ({ commands }) => {
        return commands.setMark(this.name);
      },
      toggleInsertion: () => ({ commands }) => {
        return commands.toggleMark(this.name);
      },
      unsetInsertion: () => ({ commands }) => {
        return commands.unsetMark(this.name);
      },
    };
  },
});

export const Deletion = Mark.create({
  name: 'deletion',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'suggestion-deletion',
      },
    };
  },

  parseHTML() {
    return [{ tag: 'del' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['del', { ...this.options.HTMLAttributes, ...HTMLAttributes }, 0];
  },

  addCommands() {
    return {
      setDeletion: () => ({ commands }) => {
        return commands.setMark(this.name);
      },
      toggleDeletion: () => ({ commands }) => {
        return commands.toggleMark(this.name);
      },
      unsetDeletion: () => ({ commands }) => {
        return commands.unsetMark(this.name);
      },
    };
  },
}); 