/**
 * Track Changes Extension - FreeFlow A+++ Implementation
 * Google Docs/Notion-style suggestions mode for collaborative editing
 */

import { Extension, Mark, Node } from '@tiptap/core';
import { Plugin, PluginKey, Transaction } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { v4 as uuidv4 } from 'uuid';

// =====================================================
// Types
// =====================================================

export interface Suggestion {
  id: string;
  type: 'insertion' | 'deletion' | 'replacement' | 'formatting';
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: {
    original?: string;
    suggested?: string;
    from: number;
    to: number;
  };
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  comments?: SuggestionComment[];
}

export interface SuggestionComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

export interface TrackChangesOptions {
  enabled: boolean;
  currentUser: {
    id: string;
    name: string;
    avatar?: string;
  };
  onSuggestionCreate?: (suggestion: Suggestion) => void;
  onSuggestionUpdate?: (suggestion: Suggestion) => void;
  onSuggestionAccept?: (suggestion: Suggestion) => void;
  onSuggestionReject?: (suggestion: Suggestion) => void;
}

// =====================================================
// Plugin Key
// =====================================================

export const trackChangesPluginKey = new PluginKey('trackChanges');

// =====================================================
// Track Changes Extension
// =====================================================

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    trackChanges: {
      enableTrackChanges: () => ReturnType;
      disableTrackChanges: () => ReturnType;
      toggleTrackChanges: () => ReturnType;
      acceptSuggestion: (suggestionId: string) => ReturnType;
      rejectSuggestion: (suggestionId: string) => ReturnType;
      acceptAllSuggestions: () => ReturnType;
      rejectAllSuggestions: () => ReturnType;
      addSuggestionComment: (suggestionId: string, comment: string) => ReturnType;
    };
  }
}

export const TrackChangesExtension = Extension.create<TrackChangesOptions>({
  name: 'trackChanges',

  addOptions() {
    return {
      enabled: false,
      currentUser: {
        id: 'anonymous',
        name: 'Anonymous',
      },
      onSuggestionCreate: undefined,
      onSuggestionUpdate: undefined,
      onSuggestionAccept: undefined,
      onSuggestionReject: undefined,
    };
  },

  addStorage() {
    return {
      suggestions: new Map<string, Suggestion>(),
      isEnabled: false,
    };
  },

  addCommands() {
    return {
      enableTrackChanges:
        () =>
        ({ editor }) => {
          this.storage.isEnabled = true;
          editor.view.dispatch(editor.state.tr.setMeta(trackChangesPluginKey, { enabled: true }));
          return true;
        },

      disableTrackChanges:
        () =>
        ({ editor }) => {
          this.storage.isEnabled = false;
          editor.view.dispatch(editor.state.tr.setMeta(trackChangesPluginKey, { enabled: false }));
          return true;
        },

      toggleTrackChanges:
        () =>
        ({ editor }) => {
          this.storage.isEnabled = !this.storage.isEnabled;
          editor.view.dispatch(
            editor.state.tr.setMeta(trackChangesPluginKey, { enabled: this.storage.isEnabled })
          );
          return true;
        },

      acceptSuggestion:
        (suggestionId: string) =>
        ({ editor, tr }) => {
          const suggestion = this.storage.suggestions.get(suggestionId);
          if (!suggestion) return false;

          // Apply the suggestion
          if (suggestion.type === 'insertion') {
            // Remove the insertion mark, keep the text
            const { from, to } = suggestion.content;
            tr.removeMark(from, to, editor.schema.marks.insertion);
          } else if (suggestion.type === 'deletion') {
            // Remove the deleted content
            const { from, to } = suggestion.content;
            tr.delete(from, to);
          } else if (suggestion.type === 'replacement') {
            // Keep the new content, remove marks
            const { from, to } = suggestion.content;
            tr.removeMark(from, to, editor.schema.marks.insertion);
          }

          // Update suggestion status
          suggestion.status = 'accepted';
          suggestion.resolvedAt = new Date().toISOString();
          suggestion.resolvedBy = this.options.currentUser.id;

          this.storage.suggestions.set(suggestionId, suggestion);

          if (this.options.onSuggestionAccept) {
            this.options.onSuggestionAccept(suggestion);
          }

          return true;
        },

      rejectSuggestion:
        (suggestionId: string) =>
        ({ editor, tr }) => {
          const suggestion = this.storage.suggestions.get(suggestionId);
          if (!suggestion) return false;

          // Revert the suggestion
          if (suggestion.type === 'insertion') {
            // Remove the inserted text
            const { from, to } = suggestion.content;
            tr.delete(from, to);
          } else if (suggestion.type === 'deletion') {
            // Remove the deletion mark, restore text
            const { from, to } = suggestion.content;
            tr.removeMark(from, to, editor.schema.marks.deletion);
          } else if (suggestion.type === 'replacement') {
            // Restore original content
            const { from, to, original } = suggestion.content;
            if (original) {
              tr.replaceWith(from, to, editor.schema.text(original));
            }
          }

          // Update suggestion status
          suggestion.status = 'rejected';
          suggestion.resolvedAt = new Date().toISOString();
          suggestion.resolvedBy = this.options.currentUser.id;

          this.storage.suggestions.set(suggestionId, suggestion);

          if (this.options.onSuggestionReject) {
            this.options.onSuggestionReject(suggestion);
          }

          return true;
        },

      acceptAllSuggestions:
        () =>
        ({ commands }) => {
          const suggestions = Array.from(this.storage.suggestions.values()).filter(
            (s) => s.status === 'pending'
          );

          suggestions.forEach((suggestion) => {
            commands.acceptSuggestion(suggestion.id);
          });

          return true;
        },

      rejectAllSuggestions:
        () =>
        ({ commands }) => {
          const suggestions = Array.from(this.storage.suggestions.values()).filter(
            (s) => s.status === 'pending'
          );

          suggestions.forEach((suggestion) => {
            commands.rejectSuggestion(suggestion.id);
          });

          return true;
        },

      addSuggestionComment:
        (suggestionId: string, comment: string) =>
        () => {
          const suggestion = this.storage.suggestions.get(suggestionId);
          if (!suggestion) return false;

          const newComment: SuggestionComment = {
            id: uuidv4(),
            authorId: this.options.currentUser.id,
            authorName: this.options.currentUser.name,
            authorAvatar: this.options.currentUser.avatar,
            content: comment,
            createdAt: new Date().toISOString(),
          };

          suggestion.comments = suggestion.comments || [];
          suggestion.comments.push(newComment);

          this.storage.suggestions.set(suggestionId, suggestion);

          if (this.options.onSuggestionUpdate) {
            this.options.onSuggestionUpdate(suggestion);
          }

          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const extension = this;

    return [
      new Plugin({
        key: trackChangesPluginKey,

        state: {
          init() {
            return { enabled: extension.options.enabled };
          },
          apply(tr, value) {
            const meta = tr.getMeta(trackChangesPluginKey);
            if (meta) {
              return { enabled: meta.enabled };
            }
            return value;
          },
        },

        appendTransaction(transactions, oldState, newState) {
          if (!extension.storage.isEnabled) return null;

          const docChanged = transactions.some((tr) => tr.docChanged);
          if (!docChanged) return null;

          let tr = newState.tr;

          transactions.forEach((transaction) => {
            if (!transaction.docChanged) return;

            transaction.steps.forEach((step, stepIndex) => {
              const stepMap = transaction.mapping.maps[stepIndex];
              if (!stepMap) return;

              stepMap.forEach((oldStart, oldEnd, newStart, newEnd) => {
                if (newEnd > newStart) {
                  // Content was inserted
                  const suggestionId = uuidv4();
                  const insertedContent = newState.doc.textBetween(newStart, newEnd);

                  const suggestion: Suggestion = {
                    id: suggestionId,
                    type: 'insertion',
                    authorId: extension.options.currentUser.id,
                    authorName: extension.options.currentUser.name,
                    authorAvatar: extension.options.currentUser.avatar,
                    content: {
                      suggested: insertedContent,
                      from: newStart,
                      to: newEnd,
                    },
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                    comments: [],
                  };

                  extension.storage.suggestions.set(suggestionId, suggestion);

                  // Apply insertion mark
                  const insertionMark = newState.schema.marks.insertion.create({
                    suggestionId,
                  });
                  tr = tr.addMark(newStart, newEnd, insertionMark);

                  if (extension.options.onSuggestionCreate) {
                    extension.options.onSuggestionCreate(suggestion);
                  }
                }

                if (oldEnd > oldStart && newEnd <= newStart) {
                  // Content was deleted - we need to mark for deletion instead of actually deleting
                  // This is handled by the deletion mark
                }
              });
            });
          });

          return tr.steps.length > 0 ? tr : null;
        },

        props: {
          decorations(state) {
            const decorations: Decoration[] = [];

            extension.storage.suggestions.forEach((suggestion, id) => {
              if (suggestion.status !== 'pending') return;

              const { from, to } = suggestion.content;
              if (from >= 0 && to <= state.doc.content.size) {
                const className =
                  suggestion.type === 'insertion'
                    ? 'track-changes-insertion'
                    : suggestion.type === 'deletion'
                    ? 'track-changes-deletion'
                    : 'track-changes-replacement';

                decorations.push(
                  Decoration.inline(from, to, {
                    class: className,
                    'data-suggestion-id': id,
                    'data-suggestion-type': suggestion.type,
                    'data-author-id': suggestion.authorId,
                  })
                );
              }
            });

            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});

// =====================================================
// Insertion Mark
// =====================================================

export const InsertionMark = Mark.create({
  name: 'insertion',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      suggestionId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-suggestion-id'),
        renderHTML: (attributes) => ({
          'data-suggestion-id': attributes.suggestionId,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'ins[data-suggestion-id]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'ins',
      {
        ...this.options.HTMLAttributes,
        ...HTMLAttributes,
        class: 'track-changes-insertion',
      },
      0,
    ];
  },
});

// =====================================================
// Deletion Mark
// =====================================================

export const DeletionMark = Mark.create({
  name: 'deletion',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      suggestionId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-suggestion-id'),
        renderHTML: (attributes) => ({
          'data-suggestion-id': attributes.suggestionId,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'del[data-suggestion-id]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'del',
      {
        ...this.options.HTMLAttributes,
        ...HTMLAttributes,
        class: 'track-changes-deletion',
      },
      0,
    ];
  },
});

// =====================================================
// Export all
// =====================================================

export default TrackChangesExtension;
