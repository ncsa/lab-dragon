import { mergeAttributes } from '@tiptap/core'
import Mention from "@tiptap/extension-mention";

export const createGraphicMention = (graphicMentionsOptionsRef) => {
  return Mention.extend({
    name: 'graphicMention', // Unique name for the GraphicMention extension
    renderHTML({node, HTMLAttributes}) {
      
      const name = graphicMentionsOptionsRef.current[node.attrs.id][0]
      const insID = graphicMentionsOptionsRef.current[node.attrs.id][1]

      if (name.endsWith('.html')) {
        return [
          'iframe',
          mergeAttributes({'data-type': this.name}, {'src': `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/properties/image/${graphicMentionsOptionsRef.current[node.attrs.id][0]}`}, this.options.HTMLAttributes, HTMLAttributes),
          // mergeAttributes({'data-type': this.name}, {'src': `/api/properties/image/${graphicMentionsOptionsRef.current[node.attrs.id][0]}`}, this.options.HTMLAttributes, HTMLAttributes),
          this.options.renderLabel({
            options: this.options,
            node,
          }),
        ];
      } else if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg')) {
        return [
          'a',
          mergeAttributes(
            {'href': `/entities/${insID}`}, 
            this.options.HTMLAttributes, 
            HTMLAttributes
          ),
          [
            'img',
            {'src': `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/properties/image/${name}`}
            // {'src': `/api/properties/image/${name}`}
          ]
        ];
      } else {
        throw new Error("Unsupported file type for graphic mention.");
      }
      
      
    },
  })
}