import { mergeAttributes } from '@tiptap/core'
import Mention from "@tiptap/extension-mention";


export const createDataMention = (dataMentionsOptionsRef) => {
  
  return Mention.extend({

    renderHTML({node, HTMLAttributes}) {
      return [
        'a',
        mergeAttributes({'data-type': this.name}, {'href': dataMentionsOptionsRef.current[node.attrs.id]}, this.options.HTMLAttributes, HTMLAttributes),
        this.options.renderLabel({
          options: this.options,
          node,
        }),
      ]
    },
  })
}