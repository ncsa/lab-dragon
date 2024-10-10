"use client"

import '../../globals.css';

import React, { useState, useEffect, useRef, useContext } from "react";
import tippy from "tippy.js";
import { useEditor, EditorContent, ReactRenderer, BubbleMenu, FloatingMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { MentionList } from "./MentionList";
import { PluginKey } from "prosemirror-state";
import { createDataMention } from "./extensions/DataMention";
import { createGraphicMention } from "./extensions/GraphicMention";
import { Iframe } from "./extensions/Iframe";
import {Image as TiptapImage} from "@tiptap/extension-image";

import { Box } from "@mui/material";

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

  const [isCursorInTable, setIsCursorInTable] = useState(false);

  const dataMentionsOptionsRef = useRef({});
  const graphicMentionsOptionsRef = useRef({});

  const updateDataMentionsOptions = async (query) => {
    let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/properties/data_suggestions/` + entID ;
    if (query) {
      url += "?query_filter=" + query;
    }
    const response = await fetch(url);
    const data = JSON.parse(await response.json());
    dataMentionsOptionsRef.current = data;
  }

  const updateGraphicMentionsOptions = async (query) => {
    let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/properties/graphic_suggestions/` + entID ;
    if (query) {
      url += "?query_filter=" + query;
    }
    const response = await fetch(url);
    const data = JSON.parse(await response.json());
    graphicMentionsOptionsRef.current = data;
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
    updateGraphicMentionsOptions();
  }, []);

  useEffect(() => {
    if (editor) {
    editor.commands.setContent(initialContent);
    }
  }, [initialContent]);

  useEffect(() => {
    if (reloadEditor) {
      editor.commands.setContent("");
      editor.commands.focus();
    }
  
  }, [reloadEditor,])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      Link,
      Placeholder.configure({
        placeholder: "Write a comment here..."
      }),
      TiptapImage.configure({inline: true}),
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
      createGraphicMention(graphicMentionsOptionsRef).configure({
        HTMLAttributes: {
          class: "graphic-mention"
        },
        renderLabel: ({options, node}) => {
            return `${node.attrs.label ?? node.attrs.id}`
        },
        suggestion: {
          items: async ({ query }) => {
            await updateGraphicMentionsOptions(query);
            const keys = Object.keys(graphicMentionsOptionsRef.current);
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
    onSelectionUpdate: ({ editor }) => {
      // Check if the cursor is in a table and update the state
      const { selection } = editor.state;
      const { $anchor } = selection;
      if (!$anchor || !$anchor.node) return;
      const isInTable = !!$anchor.node(-1).type.spec.tableRole; // Checks if the parent node has a tableRole
      setIsCursorInTable(isInTable);
    },
    content: initialContent ? initialContent : '',
  });

  if (!editor) {
    return null;
  }
  return (
    <Box sx={{ backgroundColor: '#ffffff' }}>
      <EditorContent editor={editor} />
    </Box>
  )
  // return (
  //   // <div className="tiptap" >
  //   // <div>
  //     {/*<div className="tiptap-buttons">*/}
  //     {/*  <button type="button" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>Insert Table</button>*/}
  //     {/*  {isCursorInTable && (*/}
  //     {/*    <div>*/}
  //     {/*      <button type="button" onClick={(e) => {e.stopPropagation(); editor.chain().focus().deleteTable().run()}}>Delete Table</button>*/}
  //     {/*      <button type="button" onClick={(e) => {e.stopPropagation(); editor.chain().focus().addColumnAfter().run()}}>Add Column</button>*/}
  //     {/*      <button type="button" onClick={(e) => {e.stopPropagation(); editor.chain().focus().deleteColumn().run()}}>Delete Column</button>*/}
  //     {/*      <button type="button" onClick={(e) => {e.stopPropagation(); editor.chain().focus().addRowAfter().run()}}>Add Row</button>*/}
  //     {/*      <button type="button" onClick={(e) => {e.stopPropagation(); editor.chain().focus().deleteRow().run()}}>Delete Row</button>*/}
  //     {/*    </div>*/}
  //     {/*  )}*/}
  //     {/*</div>*/}
  //     {/*<BubbleMenu className="tiptap-bubble-menu" editor={editor} tippyOptions={{ duration: 100 }}>*/}
  //     {/*  <button type="button" className={editor.isActive('bold') ? 'is-active' : ''} onClick={() => editor.chain().focus().toggleBold().run()}>Bold</button>*/}
  //     {/*  <button type="button" className={editor.isActive('italic') ? 'is-active' : ''} onClick={() => editor.chain().focus().toggleItalic().run()}>Italic</button>*/}
  //     {/*  <button type="button" className={editor.isActive('strike') ? 'is-active' : ''} onClick={() => editor.chain().focus().toggleStrike().run()}>Strike</button>*/}
  //     {/*</BubbleMenu>*/}
  //     {/*{editor && <FloatingMenu className="floating-menu" tippyOptions={{ duration: 100 }} editor={editor}>*/}
  //     {/*  <button type="button" className={editor.isActive('bulletList') ? 'is-active' : ''} onClick={() => editor.chain().focus().toggleBulletList().run()} > Bullet List </button>*/}
  //     {/*  <button type="button" className={editor.isActive('orderedList') ? 'is-active' : ''} onClick={() => editor.chain().focus().toggleOrderedList().run()}> Ordered List </button>*/}
  //     {/*  <button type="button" className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}> H1 </button>*/}
  //     {/*  <button type="button" className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}> H2 </button>*/}
  //     {/*  <button type="button" className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}> H3 </button>*/}
  //     {/*</FloatingMenu>}*/}
  //     <EditorContent editor={editor} />
  //   </div>
  // );
};