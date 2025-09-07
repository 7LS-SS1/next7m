'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Image from '@tiptap/extension-image'

/**
 * RichTextAnnounce (TipTap version)
 * - Robust editor (no document.execCommand)
 * - Works reliably with toolbar controls, selection, paste, etc.
 * - Syncs HTML to hidden input for server submit
 */
export default function RichTextAnnounce({
  id,
  name = 'content',
  defaultHTML = '',
  initialHTML,
  value,
  onChangeHTML,
  minHeight = 320,
  placeholder = 'เขียนประกาศของคุณที่นี่... (รองรับหัวข้อ H2/H3, ตัวหนา/เอียง, รายการ, อ้างอิง, โค้ด)',
  className = '',
}: {
  id?: string
  name?: string
  defaultHTML?: string
  initialHTML?: string
  value?: string
  onChangeHTML?: (html: string) => void
  minHeight?: number
  placeholder?: string
  className?: string
}) {
  const hiddenRef = useRef<HTMLInputElement | null>(null)

  // ใช้ initial content ตาม priority
  const initialContent = useMemo(() => (value ?? initialHTML ?? defaultHTML) || '', [value, initialHTML, defaultHTML])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: true,
        blockquote: true,
        bulletList: true,
        orderedList: true,
      }),
      // Underline,
      Link.configure({ openOnClick: true, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
      Image.configure({ inline: false, allowBase64: false })
    ],
    content: initialContent,
    onUpdate({ editor }) {
      const html = editor.getHTML()
      if (hiddenRef.current) hiddenRef.current.value = html
      onChangeHTML?.(html)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none outline-none',
      },
      handlePaste(view, event) {
        // ปล่อยให้ TipTap จัดการ paste (มี sanitize พื้นฐาน)
        return false
      },
    },
    autofocus: false,
  })

  // sync controlled value → editor
  useEffect(() => {
    if (!editor) return
    if (value !== undefined && value !== editor.getHTML()) {
      editor.commands.setContent(value, false)
      if (hiddenRef.current) hiddenRef.current.value = value
    }
  }, [value, editor])

  // placeholder แบบ overlay เมื่อไม่มีเนื้อหา
  const showPlaceholder = editor ? editor.isEmpty : !initialContent

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="sticky top-2 z-10 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] p-2 backdrop-blur supports-[backdrop-filter]:bg-white/[0.06]">
        <Button onClick={() => editor?.chain().focus().toggleBold().run()} active={!!editor?.isActive('bold')} title="ตัวหนา"><b>B</b></Button>
        <Button onClick={() => editor?.chain().focus().toggleItalic().run()} active={!!editor?.isActive('italic')} title="ตัวเอียง"><i>I</i></Button>
        <Button onClick={() => editor?.chain().focus().toggleUnderline().run()} active={!!editor?.isActive('underline')} title="ขีดเส้นใต้"><u>U</u></Button>
        <Divider />
        <Button onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={!!editor?.isActive('heading', { level: 2 })} title="หัวข้อ H2">H2</Button>
        <Button onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} active={!!editor?.isActive('heading', { level: 3 })} title="หัวข้อ H3">H3</Button>
        <Button onClick={() => editor?.chain().focus().setParagraph().run()} active={!!editor?.isActive('paragraph')} title="ย่อหน้า">¶</Button>
        <Button onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={!!editor?.isActive('blockquote')} title="อ้างอิง">❝❞</Button>
        <Divider />
        <Button onClick={() => editor?.chain().focus().toggleBulletList().run()} active={!!editor?.isActive('bulletList')} title="ลิสต์จุด">•</Button>
        <Button onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={!!editor?.isActive('orderedList')} title="ลิสต์เลข">1.</Button>
        <Divider />
        <Button onClick={() => editor?.chain().focus().toggleCodeBlock().run()} active={!!editor?.isActive('codeBlock')} title="โค้ดบล็อก">{'</>'}</Button>
        <Button onClick={insertLink(editor)} title="แทรกลิงก์">🔗</Button>
        <Button onClick={insertImage(editor)} title="แทรกรูป">🖼️</Button>
        <Button onClick={() => editor?.chain().focus().setHorizontalRule().run()} title="เส้นคั่น">━</Button>
        <Divider />
        <Button onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()} title="ล้างรูปแบบ">⟲</Button>
      </div>

      {/* Editor */}
      <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        {showPlaceholder && (
          <div className="pointer-events-none absolute left-5 right-5 top-4 select-none text-sm text-white/40">
            {placeholder}
          </div>
        )}
        <div className="min-h-[1rem]" style={{ minHeight }}>
          <EditorContent editor={editor} id={id} />
        </div>
      </div>

      {/* hidden input for server submit */}
      <input ref={hiddenRef} type="hidden" name={name} defaultValue={initialContent} />
    </div>
  )
}

function Button({ onClick, active, title, children }: { onClick: () => void; active?: boolean; title?: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`grid h-9 w-9 place-items-center rounded-lg border text-sm active:translate-y-px ${
        active ? 'border-emerald-400 bg-emerald-400/10' : 'border-white/10 bg-white/[0.05] hover:bg-white/[0.1]'
      }`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-white/10" />
}

function insertLink(editor: any) {
  return () => {
    if (!editor) return
    const url = prompt('ใส่ URL ที่ต้องการลิงก์ไป:')?.trim()
    if (!url) return
    try {
      const u = new URL(url, window.location.origin)
      editor.chain().focus().extendMarkRange('link').setLink({ href: u.toString() }).run()
    } catch {}
  }
}

function insertImage(editor: any) {
  return () => {
    if (!editor) return
    const url = prompt('ใส่ URL รูปภาพ (https://...)')?.trim()
    if (!url) return
    try {
      const u = new URL(url, window.location.origin)
      editor.chain().focus().setImage({ src: u.toString(), alt: '' }).run()
    } catch {}
  }
}
