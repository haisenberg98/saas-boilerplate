'use client';
import React, { useCallback } from 'react';
import { BubbleMenu, useEditor, EditorContent } from '@tiptap/react';

import Heading from '@tiptap/extension-heading';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Dropcursor from '@tiptap/extension-dropcursor';
import Image from '@tiptap/extension-image';
import BulletList from '@tiptap/extension-bullet-list';
import ListItem from '@tiptap/extension-list-item';
import OrderedList from '@tiptap/extension-ordered-list';
import TextAlign from '@tiptap/extension-text-align';
import Youtube from '@tiptap/extension-youtube';
import { IframeExtension } from './IFrameExtension';
import Document from '@tiptap/extension-document';

import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import History from '@tiptap/extension-history';
import Link from '@tiptap/extension-link';

//utils
import {
  TipTapImageExtension,
  TipTapYoutubeExtension,
} from './TipTapMediaExtension';

type TiptapProps = {
  setEditorContentState: React.Dispatch<React.SetStateAction<string>>;
  initialContent?: string;
};

// Helper function to extract YouTube video ID from the entered URL
const extractYoutubeVideoId = (url: string) => {
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const matches = url.match(regex);
  return matches ? matches[1] : null;
};

const Tiptap = ({ setEditorContentState, initialContent }: TiptapProps) => {
  // Initialize the editor
  const editor = useEditor({
    editorProps: {
      attributes: {
        class: 'mx-auto p-4 focus:outline-none focus:ring-customPrimary',
      },
    },
    extensions: [
      Document,
      Paragraph,
      Text,
      Heading,
      Bold,
      Italic,
      Dropcursor,
      BulletList,
      OrderedList,
      ListItem,
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image', 'youtube'],
      }),
      Image,
      TipTapImageExtension,
      Youtube.configure({
        controls: false,
        nocookie: true,
        inline: true,
        autoplay: true,
      }),
      IframeExtension,
      TipTapYoutubeExtension,
      History,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
      }),
    ],
    content: initialContent || '', // Set initial content
    onUpdate: ({ editor }) => {
      const content = editor.getHTML(); // Get the HTML content from the editor
      setEditorContentState(content); // Store content in the parent component's state
    },
  });

  // Ensure useCallback is always used consistently
  const addImage = useCallback(() => {
    if (!editor) return; // Ensure editor exists
    const url = window.prompt('Enter Image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addYoutubeVideo = () => {
    if (!editor) return; // Ensure editor exists
    const url = prompt('Enter YouTube URL');

    if (url) {
      // Extract YouTube video ID from the entered URL
      const videoId = extractYoutubeVideoId(url);

      if (videoId) {
        // Build the dynamic embed URL
        const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&controls=1`;

        // Insert the dynamic video into the editor
        editor
          .chain()
          .focus()
          .setYoutubeVideo({
            src: embedUrl,
            // width: 320,
            // height: 240,
            width: 680,
            height: 420,
          })
          .run();
      } else {
        alert('Invalid YouTube URL');
      }
    }
  };

  const setLink = useCallback(() => {
    if (!editor) {
      return;
    }
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();

      return;
    }

    // update link
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url, target: '_blank' })
      .run();
  }, [editor]);

  return (
    <div>
      <div className='toolbar grid grid-cols-4 md:grid-cols-6 gap-2 text-xs'>
        {/* Image button */}
        <button onClick={addImage} type='button'>
          Image
        </button>
        <button id='add' onClick={addYoutubeVideo} type='button'>
          YouTube
        </button>
        <button
          onClick={() => editor?.chain().focus().undo().run()}
          disabled={!editor?.can().undo()}
          type='button'
        >
          Undo
        </button>
        <button
          onClick={() => editor?.chain().focus().redo().run()}
          disabled={!editor?.can().redo()}
          type='button'
        >
          Redo
        </button>
      </div>
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className='toolbar grid grid-cols-4 md:grid-cols-6 gap-2 text-xs'>
            <button
              onClick={() => editor?.chain().focus().toggleBold().run()}
              disabled={!editor?.can().chain().focus().toggleBold().run()}
              type='button'
            >
              Bold
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              disabled={!editor?.can().chain().focus().toggleItalic().run()}
              className='px-2 py-1 bg-customPrimary text-white rounded-md'
              type='button'
            >
              Italic
            </button>

            {/* Heading buttons */}
            <button
              onClick={() =>
                editor?.chain().focus().toggleHeading({ level: 1 }).run()
              }
              className={
                editor?.isActive('heading', { level: 1 }) ? 'is-active' : ''
              }
              type='button'
            >
              H1
            </button>
            <button
              onClick={() =>
                editor?.chain().focus().toggleHeading({ level: 2 }).run()
              }
              className={
                editor?.isActive('heading', { level: 2 }) ? 'is-active' : ''
              }
              type='button'
            >
              H2
            </button>
            <button
              onClick={() =>
                editor?.chain().focus().toggleHeading({ level: 3 }).run()
              }
              className={
                editor?.isActive('heading', { level: 3 }) ? 'is-active' : ''
              }
              type='button'
            >
              H3
            </button>

            <button
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={editor?.isActive('bulletList') ? 'is-active' : ''}
              type='button'
            >
              Bullet
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={editor?.isActive('orderedList') ? 'is-active' : ''}
              type='button'
            >
              Ordered
            </button>
            <button
              onClick={() =>
                editor?.chain().focus().splitListItem('listItem').run()
              }
              disabled={!editor?.can().splitListItem('listItem')}
              type='button'
            >
              Split List
            </button>
            <button
              onClick={() =>
                editor?.chain().focus().sinkListItem('listItem').run()
              }
              disabled={!editor?.can().sinkListItem('listItem')}
              type='button'
            >
              Sink List
            </button>
            <button
              onClick={() =>
                editor?.chain().focus().liftListItem('listItem').run()
              }
              disabled={!editor?.can().liftListItem('listItem')}
              type='button'
            >
              Lift List
            </button>
            <button
              onClick={() => editor?.chain().focus().setTextAlign('left').run()}
              className={
                editor?.isActive({ textAlign: 'left' }) ? 'is-active' : ''
              }
              type='button'
            >
              Left
            </button>
            <button
              onClick={() =>
                editor?.chain().focus().setTextAlign('center').run()
              }
              className={
                editor?.isActive({ textAlign: 'center' }) ? 'is-active' : ''
              }
              type='button'
            >
              Center
            </button>
            <button
              onClick={setLink}
              className={editor.isActive('link') ? 'is-active' : ''}
              type='button'
            >
              Set link
            </button>
            <button
              onClick={() => editor.chain().focus().unsetLink().run()}
              disabled={!editor.isActive('link')}
              type='button'
            >
              Unset link
            </button>
          </div>
        </BubbleMenu>
      )}

      {/* Editor Content */}
      {editor && (
        <EditorContent
          className='mt-4 border-2 border-gray-300 rounded-md'
          editor={editor}
          style={{ overflowY: 'auto', color: 'black' }}
        />
      )}
    </div>
  );
};

export default Tiptap;
