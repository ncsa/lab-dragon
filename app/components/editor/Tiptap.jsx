"use client"

import React from "react";
import tippy from "tippy.js";
import { useEditor, EditorContent, ReactRenderer } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
// import CharacterCount from "@tiptap/extension-character-count";
import Mention from "@tiptap/extension-mention";
import { MentionList } from "./MentionList";
import "./styles.css";
import { PluginKey } from "prosemirror-state";


const BASE_API = "http://localhost:8000/api/"


export default () => {
  const limit = 280;

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Mention.configure({
        HTMLAttributes: {
          class: "mention"
        },
        renderLabel: ({options, node}) => {
            return `${node.attrs.label ?? node.attrs.id}`
        },
        suggestion: {
          items: async ({ query }) => {
            const response = await fetch(BASE_API + "testing/fake_mentions");
            const data = await response.json();
            console.log('HELLO I AM HERE I AM HERE')
            console.log(data)
            console.log("THe query")
            console.log(query)
            return JSON.parse(data);
            return ["hello", "bye bye", "something else"]
          },
          char: "@",
          pluginKey: new PluginKey("atKey"),
          render: () => {
            let reactRenderer;
            let popup;

            return {
              onStart: (props) => {
                reactRenderer = new ReactRenderer(MentionList, {
                  props,
                  editor: props.editor
                });

                popup = tippy("body", {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: reactRenderer.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: "manual",
                  placement: "bottom-start"
                });
              },
              onUpdate(props) {
                reactRenderer.updateProps(props);

                popup[0].setProps({
                  getReferenceClientRect: props.clientRect
                });
              },
              onKeyDown(props) {
                return reactRenderer.ref?.onKeyDown(props);
              },
              onExit() {
                popup[0].destroy();
                reactRenderer.destroy();
              }
            };
          }
        },

      }),
      Mention.configure({
        HTMLAttributes: {
          class: "mention"
        },
        renderLabel: ({options, node}) => {
            return `${node.attrs.label ?? node.attrs.id}`
        },
        suggestion: {
          items: ({ query }) => {
            return ["hola", "chau chau"];
          },
          char: "#",
          pluginKey: new PluginKey("hashKey"),
          render: () => {
            let reactRenderer;
            let popup;

            return {
              onStart: (props) => {
                reactRenderer = new ReactRenderer(MentionList, {
                  props,
                  editor: props.editor
                });

                popup = tippy("body", {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: reactRenderer.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: "manual",
                  placement: "bottom-start"
                });
              },
              onUpdate(props) {
                reactRenderer.updateProps(props);

                popup[0].setProps({
                  getReferenceClientRect: props.clientRect
                });
              },
              onKeyDown(props) {
                return reactRenderer.ref?.onKeyDown(props);
              },
              onExit() {
                popup[0].destroy();
                reactRenderer.destroy();
              }
            };
          }
        }
      })
    ],
    content: `
      <p>
       Write a comment here...
      </p>
    `
  });

  return (
    <div>
      <EditorContent editor={editor} />
    </div>
  );
};
