import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PageRenderer from "../renderer/PageRenderer";

const previewBaseStyles = `
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    min-height: 100%;
    overflow-x: hidden;
    background: #f5efe7;
  }

  body {
    font-family: inherit;
  }

  #preview-root {
    width: 100%;
    min-height: 100vh;
  }
`;

const copyStylesToIframe = (targetDocument) => {
  const styleNodes = Array.from(
    document.querySelectorAll('link[rel="stylesheet"], style'),
  );

  styleNodes.forEach((node) => {
    targetDocument.head.appendChild(node.cloneNode(true));
  });
};

const PreviewFrame = ({ blocks, width = 1280, minHeight = 900 }) => {
  const iframeRef = useRef(null);
  const [mountNode, setMountNode] = useState(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="ru">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>${previewBaseStyles}</style>
        </head>
        <body>
          <div id="preview-root"></div>
        </body>
      </html>
    `);
    doc.close();

    copyStylesToIframe(doc);
    setMountNode(doc.getElementById("preview-root"));
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const resizeToContent = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;

      const nextHeight = Math.max(
        minHeight,
        doc.body.scrollHeight,
        doc.documentElement.scrollHeight,
      );

      iframe.style.height = `${nextHeight}px`;
    };

    resizeToContent();

    const timeoutId = window.setTimeout(resizeToContent, 150);

    return () => window.clearTimeout(timeoutId);
  }, [blocks, minHeight]);

  return (
    <div
      className="builder-preview-viewport"
      style={{ width: `${width}px`, maxWidth: "100%" }}
    >
      <iframe
        ref={iframeRef}
        title="Предпросмотр страницы"
        className="builder-preview-iframe"
      />
      {mountNode && createPortal(<PageRenderer blocks={blocks} />, mountNode)}
    </div>
  );
};

export default PreviewFrame;
