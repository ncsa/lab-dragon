import { Node, mergeAttributes } from '@tiptap/core'

export const Iframe = Node.create({
  name: 'iframe',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      frameborder: {
        default: '0',
      },
      allowfullscreen: {
        default: 'true',
      },
      width: {
        default: '560',
      },
      height: {
        default: '315',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'iframe',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['iframe', mergeAttributes(HTMLAttributes)]
  },

  addCommands() {
    return {
      insertIframe: options => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        })
      },
    }
  },
})