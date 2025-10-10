'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useRef } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

export function RichTextEditor({ content, onChange, placeholder = 'Start typing...' }: RichTextEditorProps) {
  const isLocalChange = useRef(false)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline'
        }
      }),
      Placeholder.configure({
        placeholder
      })
    ],
    content,
    onUpdate: ({ editor }) => {
      isLocalChange.current = true
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[120px] px-4 py-3 text-gray-900'
      }
    }
  })

  // Update editor content only when content changes externally
  useEffect(() => {
    if (editor && !isLocalChange.current) {
      const currentContent = editor.getHTML()
      if (content && content !== currentContent) {
        editor.commands.setContent(content, false)
      }
    }
    isLocalChange.current = false
  }, [content, editor])

  if (!editor) {
    return <div className="min-h-[200px] bg-gray-100 animate-pulse rounded-lg" />
  }

  const ButtonGroup = ({ children }: { children: React.ReactNode }) => (
    <div className="flex gap-1 items-center">
      {children}
    </div>
  )

  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title
  }: {
    onClick: () => void
    isActive?: boolean
    disabled?: boolean
    children: React.ReactNode
    title?: string
  }) => (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        onClick()
      }}
      disabled={disabled}
      title={title}
      className={`
        px-2 py-1 rounded text-xs font-semibold transition-all
        ${isActive
          ? 'bg-blue-500 text-white shadow-sm'
          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {children}
    </button>
  )

  const Divider = () => <div className="w-px h-6 bg-gray-300" />

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 px-3 py-2 bg-gray-50 border-b border-gray-200">
        <ButtonGroup>
          <ToolbarButton
            onClick={() => {
              editor.chain().focus().toggleBold().run()
            }}
            isActive={editor.isActive('bold')}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            title="Bold (⌘+B)"
          >
            B
          </ToolbarButton>
          <ToolbarButton
            onClick={() => {
              editor.chain().focus().toggleItalic().run()
            }}
            isActive={editor.isActive('italic')}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            title="Italic (⌘+I)"
          >
            <span className="italic">I</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => {
              editor.chain().focus().toggleStrike().run()
            }}
            isActive={editor.isActive('strike')}
            title="Strikethrough"
          >
            <span className="line-through">S</span>
          </ToolbarButton>
        </ButtonGroup>

        <Divider />

        <ButtonGroup>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            H1
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            H2
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            H3
          </ToolbarButton>
        </ButtonGroup>

        <Divider />

        <ButtonGroup>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            • List
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            1. List
          </ToolbarButton>
        </ButtonGroup>

        <Divider />

        <ButtonGroup>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            disabled={!editor.can().chain().focus().toggleCode().run()}
            title="Inline Code"
          >
            <code>Code</code>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            title="Code Block"
          >
            {'{ }'}
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Quote"
          >
            " "
          </ToolbarButton>
        </ButtonGroup>

        <Divider />

        <ButtonGroup>
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            title="Undo (Ctrl+Z)"
          >
            ↶
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            title="Redo (Ctrl+Y)"
          >
            ↷
          </ToolbarButton>
        </ButtonGroup>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} className="min-h-[120px] max-h-[300px] overflow-y-auto bg-white" />
    </div>
  )
}
