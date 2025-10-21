import { Node } from '@tiptap/core';

export const IframeExtension = Node.create({
  name: 'iframe',

  group: 'block',

  atom: true, // Makes it behave as a single indivisible unit

  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: '640',
      },
      height: {
        default: '480',
      },
      allowfullscreen: {
        default: true,
      },
      frameborder: {
        default: '0',
      },
      allow: {
        default:
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
      },
      autoplay: {
        default: '0',
      },
      controls: {
        default: '1',
      },
      style: {
        default: 'display: inline;',
      },
      class: {
        default: 'youtube-video',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'iframe',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'figure', // Wrapping iframe with figure
      { style: HTMLAttributes.style }, // Default styling for figure
      [
        'iframe',
        {
          src: HTMLAttributes.src,
          width: HTMLAttributes.width,
          height: HTMLAttributes.height,
          allowfullscreen: HTMLAttributes.allowfullscreen,
          frameborder: HTMLAttributes.frameborder,
          allow: HTMLAttributes.allow,
          autoplay: HTMLAttributes.autoplay,
          controls: HTMLAttributes.controls,
          style: HTMLAttributes.style,
          class: HTMLAttributes.class,
        },
      ],
    ];
  },
});
