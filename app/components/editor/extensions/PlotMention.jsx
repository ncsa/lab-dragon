import { mergeAttributes } from '@tiptap/core'
import Mention from "@tiptap/extension-mention";


export const createPlotMention = (plotMentionsOptionsRef) => {
  
  return Mention.extend({

    renderHTML({node, HTMLAttributes}) {
      return [
        'iframe',
        mergeAttributes({'data-type': this.name}, {'src': `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/properties/image/${plotMentionsOptionsRef.current[node.attrs.id]}`}, this.options.HTMLAttributes, HTMLAttributes),
        this.options.renderLabel({
          options: this.options,
          node,
        }),
      ]
    },
  })
}