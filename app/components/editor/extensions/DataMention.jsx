import { mergeAttributes } from '@tiptap/core'
import Mention from "@tiptap/extension-mention";

export const BASE_URL = 'http://localhost:3000/entities/';

export const createDataMention = (dataMentionsOptionsRef) => {
  
  return Mention.extend({

    renderHTML({node, HTMLAttributes}) {
      return [
        'a',
        mergeAttributes({'data-type': this.name}, {'href': BASE_URL + dataMentionsOptionsRef.current[node.attrs.id]}, this.options.HTMLAttributes, HTMLAttributes),
        this.options.renderLabel({
          options: this.options,
          node,
        }),
      ]
    },
  })
}