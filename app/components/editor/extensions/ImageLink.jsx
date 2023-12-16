import { Node } from '@tiptap/core'

export default function ImageLink() {
    return (
        Node.create({
            name: 'imageLink',

            group: 'block',

            inline: true,

            atom: true,

            addAttributes() {
            return {
                src: {
                default: null,
                parseHTML: element => {
                    return {
                    src: element.getAttribute('src'),
                    href: element.getAttribute('href')
                    }
                },
                renderHTML: attributes => {
                    return {
                    src: attributes.src,
                    href: attributes.href
                    }
                },
                },
                href: {
                default: null,
                },
            }
            },

            parseHTML() {
            return [
                {
                tag: 'a',
                getAttrs: (node) => ({
                    href: node.getAttribute('href'),
                    src: node.querySelector('img').getAttribute('src'),
                }),
                },
            ]
            },

            renderHTML({ HTMLAttributes }) {
            return ['a', { ...HTMLAttributes, href: HTMLAttributes.href }, ['img', { src: HTMLAttributes.src }]]
            },
        })
    )
}