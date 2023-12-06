"use client"

import React, { useState, useEffect, useRef, useContext } from "react";
import tippy from "tippy.js";
import { useEditor, EditorContent, ReactRenderer } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Link from "@tiptap/extension-link";
import { MentionList } from "./MentionList";
import "./styles.css";
import { PluginKey } from "prosemirror-state";
import { createDataMention } from "./extensions/DataMention";
import Image from "@tiptap/extension-image";
import Dropcursor from "@tiptap/extension-dropcursor";


const BASE_API = "http://localhost:8000/api/"


export default ({ onContentChange, entID, initialContent }) => {

  const dataMentionsOptionsRef = useRef({});

  console.log("initialContent", initialContent);

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
      Image.configure({inline: true}),
      Dropcursor,
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
    editorProps: {
      handleDrop: function(view, event, slice, moved) {

        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) { // if dropping external files
          
          let file = event.dataTransfer.files[0]; // the dropped file
          let filesize = ((file.size/1024)/1024).toFixed(4); // get the filesize in MB
          if ((file.type === "image/jpeg" || file.type === "image/png") && filesize < 10) { // check valid image type under 10MB
            // check the dimensions
            let _URL = window.URL || window.webkitURL;
            let img = new Image(); /* global Image */
            img.src = _URL.createObjectURL(file);
            img.onload = function () {
              if (this.width > 5000 || this.height > 5000) {
                window.alert("Your images need to be less than 5000 pixels in height and width."); // display alert
              } else {
                // valid image so upload to server
                // uploadImage will be your function to upload the image to the server or s3 bucket somewhere
                uploadImage(file).then(function(response) { // response is the image url for where it has been saved
                  // do something with the response
                }).catch(function(error) {
                  if (error) {
                    window.alert("There was a problem uploading your image, please try again.");
                  }
                });
              }
            };
          } else {
            window.alert("Images need to be in jpg or png format and less than 10mb in size.");
          }
          return true; // handled
        }
        return false;
      }
    },
    onUpdate: (props) => {
      onContentChange(props.editor.getHTML());
    },
    content: initialContent ? initialContent : '',
  });

  return (
    <div>
      <EditorContent editor={editor} />
    </div>
  );
};
