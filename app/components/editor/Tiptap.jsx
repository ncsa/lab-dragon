"use client"

import '../../globals.css';

import React, { useState, useEffect, useRef, useContext } from "react";
import tippy from "tippy.js";
import { useEditor, EditorContent, ReactRenderer } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Link from "@tiptap/extension-link";
import { MentionList } from "./MentionList";
import { PluginKey } from "prosemirror-state";
import { createDataMention } from "./extensions/DataMention";
import {Image as TiptapImage} from "@tiptap/extension-image";
import Dropcursor from "@tiptap/extension-dropcursor";


const BASE_API = "http://localhost:8000/api/"


const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await fetch(BASE_API + "properties/image", {
    method: "POST",
    body: formData,
  });
  const url = await response.text();
  console.log("url inside", url);
  return url;
}

export default ({ onContentChange, entID, initialContent }) => {

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
      Link,
      Placeholder.configure({
        placeholder: "Write a comment here..."
      }),
      TiptapImage.configure({inline: true}),
      Dropcursor,
      createDataMention(dataMentionsOptionsRef).configure({
        HTMLAttributes: {
          class: "data-mention"
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
    editorProps: {
      handleDrop: (view, event, slice, moved) => {

        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) { // if dropping external files
          
          let file = event.dataTransfer.files[0]; // the dropped file
          let filesize = ((file.size/1024)/1024).toFixed(4); // get the filesize in MB
          if ((file.type === "image/jpeg" || file.type === "image/png") && filesize < 10) { // check valid image type under 10MB
            // check the dimensions
            let _URL = window.URL || window.webkitURL;
            let img = new Image(); /* global Image */
            img.src = _URL.createObjectURL(file);
            img.onload = function () {
              uploadImage(file).then((url) => {
                console.log("url", url);
                let transaction = view.state.tr.insertText(" ", view.state.selection.from, view.state.selection.to); // insert a space at the drop position
                let attrs = {src: url, alt: file.name}; // set the image attributes
                let node = view.state.schema.nodes.image.createAndFill(attrs); // create the image node
                transaction.replaceSelectionWith(node); // replace the space with the image node
                view.dispatch(transaction); // dispatch the transaction
              })
            };
            img.onerror = function () {
              window.alert("Invalid image. Images must be a .jpg or .png file."); // display alert
            };
            return true;
          } else {
            window.alert("Invalid image. Images must be a .jpg or .png file and less than 10MB."); // display alert
            return true;
          }
        }
      }
    },
    onUpdate: (props) => {
      onContentChange(props.editor.getHTML());
    },
    content: initialContent ? initialContent : '',
  });

  useEffect(() => {
    if (editor) {
    editor.commands.setContent(initialContent);
    }
  }, [initialContent]);

  return (
    <div>
      <EditorContent editor={editor} />
    </div>
  );
};