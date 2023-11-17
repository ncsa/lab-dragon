"use client"

import React, { useState, useEffect, useRef, useContext } from "react";
import tippy from "tippy.js";
import { useEditor, EditorContent, ReactRenderer } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { MentionList } from "./MentionList";
import "./styles.css";
import { PluginKey } from "prosemirror-state";
import { createDataMention } from "./extensions/DataMention";


const BASE_API = "http://localhost:8000/api/"


export default ({ onContentChange, entID}) => {
  
  const dataMentionsOptionsRef = useRef({});

  const updateDataMentionsOptions = async (query) => {
    let url = BASE_API + "entities/" + entID + "/data_suggestions";
    if (query) {
      url += "?query=" + query;
    }
    const response = await fetch(url);
    const data = JSON.parse(await response.json());
    dataMentionsOptionsRef.current = data;
  }

  useEffect(() => {
    updateDataMentionsOptions();
  }, []);

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      createDataMention(dataMentionsOptionsRef).configure({
        HTMLAttributes: {
          class: "data_mention"
        },
        renderLabel: ({options, node}) => {
            return `${node.attrs.label ?? node.attrs.id}`
        },
        suggestion: {
          items: async ({ query }) => {
            await updateDataMentionsOptions(query);
            const keys = Object.keys(dataMentionsOptionsRef.current);
            return keys;
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
    ],
    onUpdate: (props) => {
      onContentChange(props.editor.getHTML());
    },
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
