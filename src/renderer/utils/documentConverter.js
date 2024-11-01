import mammoth from 'mammoth';

export const convertDocxToHtml = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();

    const options = {
      styleMap: [
        'b => b',
        'i => i',
        'u => u',
        "p[style-name='Heading 1'] => h1",
        "p[style-name='Heading 2'] => h2",
        'p => p',
        "r[style-name='Strong'] => strong",
        // Add styles for header and footer
        "p[style-name='Header'] => div.header",
        "p[style-name='Footer'] => div.footer",
      ],
      transformDocument: (document) => {
        // Preserve empty paragraphs with non-breaking spaces
        document.value = document.value?.replace(
          /<p>\s*<\/p>/g,
          '<p>&nbsp;</p>',
        );
        return document;
      },
      includeDefaultStyleMap: true,
      preserveEmptyParagraphs: true,
      // Extract images as base64
      convertImage: mammoth.images.imgElement(function (image) {
        return image.read('base64').then(function (imageBuffer) {
          return {
            src: 'data:' + image.contentType + ';base64,' + imageBuffer,
          };
        });
      }),
    };

    const result = await mammoth.convertToHtml(
      { arrayBuffer: arrayBuffer },
      options,
    );

    // Add CSS for spacing and layout
    const css = `
      <style>
        .header {
          text-align: center;
          margin-bottom: 2em;
        }
        .header img {
          max-width: 100%;
          height: auto;
        }
        .footer {
          text-align: center;
          margin-top: 2em;
          border-top: 1px solid #ccc;
          padding-top: 1em;
        }
        p {
          margin: 1em 0;
          line-height: 1.5;
        }
        .document-content {
          white-space: pre-wrap;
          font-family: Arial, sans-serif;
        }
      </style>
    `;

    // Wrap the HTML content in a div with the CSS
    const finalHtml = `
      ${css}
      <div class="document-content">
        ${result.value}
      </div>
    `;

    if (result.messages.length > 0) {
      console.log('Conversion warnings:', result.messages);
    }

    return finalHtml;
  } catch (error) {
    console.error('Error converting document:', error);
    throw new Error('Failed to convert document');
  }
};
