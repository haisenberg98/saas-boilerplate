import { Image } from '@tiptap/extension-image';
import { Youtube } from '@tiptap/extension-youtube'; // Assuming you're extending an existing Youtube extension

import { mergeAttributes } from '@tiptap/react';

export const TipTapImageExtension = Image.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      // sizes: ['inline', 'block', 'left', 'right'],
    };
  },
  renderHTML({ HTMLAttributes }) {
    const { style } = HTMLAttributes;
    const mergedAttributes = {
      ...HTMLAttributes,
      style: `${HTMLAttributes.style || ''}; display: inline;`,
    };

    return [
      'figure',
      { style },
      ['img', mergeAttributes(this.options.HTMLAttributes, mergedAttributes)],
    ];
  },
});
export const TipTapYoutubeExtension = Youtube.extend({
  addOptions() {
    return {
      ...this.parent?.(),
    };
  },
  renderHTML({ HTMLAttributes }) {
    // Extract the necessary attributes for the iframe from HTMLAttributes
    const {
      src,
      width = '640',
      height = '480',
      autoplay = '0',
      controls = '1',
      allowfullscreen = 'true',
      start = '0',
      endtime = '0',
      loop = 'false',
      modestbranding = 'false',
      ivloadpolicy = '0',
    } = HTMLAttributes;

    // Merge attributes to apply styles and necessary YouTube parameters
    const mergedAttributes = {
      ...HTMLAttributes,
      class: 'youtube-video',
      style: `${HTMLAttributes.style || ''}; display: inline;`,
      src: src || '',
      width: width,
      height: height,
      allowfullscreen: allowfullscreen,
      allow:
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
      frameborder: '0',
      autoplay: autoplay,
      controls: controls,
      start: start,
      endtime: endtime,
      loop: loop,
      modestbranding: modestbranding,
      ivloadpolicy: ivloadpolicy,
    };

    return [
      'figure',
      {
        style: HTMLAttributes.style,
      },
      [
        'iframe',
        mergeAttributes(this.options.HTMLAttributes, mergedAttributes),
      ],
    ];
  },
});
