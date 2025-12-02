'use client'

import { useEffect, useRef } from 'react'

interface LivePreviewProps {
  code: {
    html: string
    css: string
    javascript: string
  }
}

export function LivePreview({ code }: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const generatePreviewHTML = () => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    ${code.css}
  </style>
</head>
<body>
  ${code.html}
  <script>
    ${code.javascript}
  </script>
</body>
</html>`
  }

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current
      const doc = iframe.contentDocument || iframe.contentWindow?.document

      if (doc) {
        doc.open()
        doc.write(generatePreviewHTML())
        doc.close()
      }
    }
  }, [code])

  return (
    <div className="w-full h-full bg-white">
      <iframe
        ref={iframeRef}
        sandbox="allow-scripts allow-same-origin"
        className="w-full h-full border-0"
        title="Live Preview"
      />
    </div>
  )
}
