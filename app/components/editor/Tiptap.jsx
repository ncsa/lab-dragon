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
import { createPlotMention } from "./extensions/PlotMention";
import { Iframe } from "./extensions/Iframe";
import {Image as TiptapImage} from "@tiptap/extension-image";
import Dropcursor from "@tiptap/extension-dropcursor";


const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/properties/image`, {
    method: "POST",
    body: formData,
  });
  const url = await response.text();
  return url;
}

export default ({ onContentChange, entID, initialContent, reloadEditor }) => {

  const dataMentionsOptionsRef = useRef({});
  const plotMentionsOptionsRef = useRef({});

  const updateDataMentionsOptions = async (query) => {
    let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/properties/data_suggestions/` + entID ;
    if (query) {
      url += "?query_filter=" + query;
    }
    const response = await fetch(url);
    const data = JSON.parse(await response.json());
    dataMentionsOptionsRef.current = data;
  }

  const updatePlotMentionsOptions = async (query) => {
    let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/properties/plot_suggestions/` + entID ;
    if (query) {
      url += "?query_filter=" + query;
    }
    const response = await fetch(url);
    const data = JSON.parse(await response.json());
    plotMentionsOptionsRef.current = data;
  }

  const handleEditorImage = (image, view) => {
    let file = image; // the dropped file
    let filesize = ((file.size/1024)/1024).toFixed(4); // get the filesize in MB
    if ((file.type === "image/jpeg" || file.type === "image/png") && filesize < 50) { // check valid image type under 10MB
      // check the dimensions
      let _URL = window.URL || window.webkitURL;
      let img = new Image(); /* global Image */
      img.src = _URL.createObjectURL(file);
      img.onload = function () {
        uploadImage(file).then((url) => {
          let transaction = view.state.tr.insertText(" ", view.state.selection.from, view.state.selection.to); // insert a space at the drop position
          let attrs = {src: `${process.env.NEXT_PUBLIC_API_BASE_URL}` + url, alt: file.name}; // set the image attributes
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
      window.alert("Invalid image. Images must be a .jpg or .png file and less than 50MB."); // display alert
      return true;
    }
  };

  useEffect(() => {
    updateDataMentionsOptions();
  }, []);

  useEffect(() => {
    updatePlotMentionsOptions();
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
      Iframe,
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
      createPlotMention(plotMentionsOptionsRef).configure({
        HTMLAttributes: {
          class: "plot-mention"
        },
        renderLabel: ({options, node}) => {
            return `${node.attrs.label ?? node.attrs.id}`
        },
        suggestion: {
          items: async ({ query }) => {
            await updatePlotMentionsOptions(query);
            const keys = Object.keys(plotMentionsOptionsRef.current);
            return keys;
          },
          char: "~",
          pluginKey: new PluginKey("tildeKey"),
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
      })
    ],
    editorProps: {
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) { // if dropping external files
          return handleEditorImage(event.dataTransfer.files[0], view);
        }
      },
      handlePaste: (view, event, slice, moved) => {
        if (event.clipboardData && event.clipboardData.items) {
          let items = event.clipboardData.items;
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
              return handleEditorImage(items[i].getAsFile(), view);
            }
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

  useEffect(() => {
    if (reloadEditor) {
      editor.commands.setContent("");
    }
  
  }, [reloadEditor,])

  return (
    <div>
      <EditorContent editor={editor} />
    </div>
  );
};