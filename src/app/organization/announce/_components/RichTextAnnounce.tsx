'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

/**
 * RichTextAnnounce (v2)
 * - บรรณาธิการข้อความแบบ Rich ที่เน้น Blog/ประกาศ
 * - UX ดีขึ้น: แถบเครื่องมือแบบลอย (sticky), ปุ่มใหญ่ชัด, กลุ่มคำสั่งแยกชัดเจน
 * - ความปลอดภัย: sanitize ก่อน submit + ตอน paste
 * - การใช้งาน: ส่งค่า HTML ผ่าน <input type="hidden" name={name} />
 */
export default function RichTextAnnounce({
  name = 'content',
  defaultHTML = '',
  minHeight = 320,
  placeholder = 'เขียนประกาศของคุณที่นี่... (รองรับหัวข้อ H2/H3, ตัวหนา/เอียง, รายการ, อ้างอิง, โค้ด)'
}: {
  name?: string
  defaultHTML?: string
  minHeight?: number
  placeholder?: string
}) {
  const editorRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [html, setHtml] = useState<string>(defaultHTML)
  const [isFocused, setIsFocused] = useState(false)

  // hook form submit → sanitize
  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    const form = el.closest('form') as HTMLFormElement | null
    if (!form) return

    const onSubmit = () => {
      const raw = editorRef.current?.innerHTML || ''
      const clean = sanitizeHTML(raw)
      if (inputRef.current) inputRef.current.value = clean
      setHtml(clean)
    }
    form.addEventListener('submit', onSubmit)
    return () => form.removeEventListener('submit', onSubmit)
  }, [])

  // sync defaultHTML เมื่อเปลี่ยนหน้า/โหลดข้อมูล
  useEffect(() => {
    setHtml(defaultHTML)
    if (editorRef.current) editorRef.current.innerHTML = defaultHTML || ''
    if (inputRef.current) inputRef.current.value = defaultHTML || ''
  }, [defaultHTML])

  // sanitize ขณะวาง (paste)
  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    const onPaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return
      const html = e.clipboardData.getData('text/html')
      const text = e.clipboardData.getData('text/plain')
      if (!html && !text) return
      e.preventDefault()
      const cleaned = sanitizeHTML(html || `<p>${escapeHtml(text)}</p>`) || ''
      document.execCommand('insertHTML', false, cleaned)
    }
    el.addEventListener('paste', onPaste as any)
    return () => el.removeEventListener('paste', onPaste as any)
  }, [])

  // execCommand helper (ยังรองรับใน browser ส่วนใหญ่)
  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val)
    editorRef.current?.focus()
  }

  // toggle โค้ดบล็อก (แปลง selection เป็น <pre><code>)
  const toggleCodeBlock = () => {
    // พยายามใช้ formatBlock ก่อน
    document.execCommand('formatBlock', false, 'pre')
    editorRef.current?.focus()
  }

  // แทรกเส้นคั่น
  const insertDivider = () => {
    document.execCommand('insertHTML', false, '<hr />')
    editorRef.current?.focus()
  }

  const ToolbarButton = ({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.05] text-sm hover:bg-white/[0.1] active:translate-y-px"
    >
      {children}
    </button>
  )

  const placeholderVisible = useMemo(
    () => !isFocused && (!html || html === '<p><br></p>' || html === '<br>'),
    [isFocused, html]
  )

  return (
    <div className="space-y-3">
      {/* Toolbar (sticky) */}
      <div className="sticky top-2 z-10 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] p-2 backdrop-blur supports-[backdrop-filter]:bg-white/[0.06]">
        {/* Headings */}
        <div className="flex items-center gap-1">
          <ToolbarButton onClick={() => exec('formatBlock', '<p>')} title="ย่อหน้า (P)">P</ToolbarButton>
          <ToolbarButton onClick={() => exec('formatBlock', '<h2>')} title="หัวข้อ H2">H2</ToolbarButton>
          <ToolbarButton onClick={() => exec('formatBlock', '<h3>')} title="หัวข้อ H3">H3</ToolbarButton>
        </div>
        <span className="h-6 w-px bg-white/10" />
        {/* Inline */}
        <div className="flex items-center gap-1">
          <ToolbarButton onClick={() => exec('bold')} title="ตัวหนา"><b>B</b></ToolbarButton>
          <ToolbarButton onClick={() => exec('italic')} title="ตัวเอียง"><i>I</i></ToolbarButton>
          <ToolbarButton onClick={() => exec('underline')} title="ขีดเส้นใต้"><u>U</u></ToolbarButton>
          <ToolbarButton onClick={() => exec('strikeThrough')} title="ขีดทับ"><s>S</s></ToolbarButton>
          <ToolbarButton onClick={() => exec('removeFormat')} title="ล้างรูปแบบ">⟲</ToolbarButton>
        </div>
        <span className="h-6 w-px bg-white/10" />
        {/* Lists */}
        <div className="flex items-center gap-1">
          <ToolbarButton onClick={() => exec('insertUnorderedList')} title="รายการหัวข้อย่อย">•</ToolbarButton>
          <ToolbarButton onClick={() => exec('insertOrderedList')} title="รายการตัวเลข">1.</ToolbarButton>
          <ToolbarButton onClick={() => exec('indent')} title="เพิ่มย่อหน้า">→</ToolbarButton>
          <ToolbarButton onClick={() => exec('outdent')} title="ลดย่อหน้า">←</ToolbarButton>
        </div>
        <span className="h-6 w-px bg-white/10" />
        {/* Insert */}
        <div className="flex items-center gap-1">
          <ToolbarButton onClick={onInsertLink} title="แทรกลิงก์">🔗</ToolbarButton>
          <ToolbarButton onClick={onInsertImage} title="แทรกรูป">🖼️</ToolbarButton>
          <ToolbarButton onClick={insertDivider} title="เส้นคั่น">━</ToolbarButton>
          <ToolbarButton onClick={toggleCodeBlock} title="โค้ดบล็อก">{`</>`}</ToolbarButton>
          <ToolbarButton onClick={() => exec('formatBlock', '<blockquote>')} title="อ้างอิง">❝❞</ToolbarButton>
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <div
          ref={editorRef}
          className="prose prose-invert max-w-none rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] focus:outline-none prose-pre:bg-white/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:bg-white/10"
          contentEditable
          style={{ minHeight }}
          onInput={(e) => setHtml((e.target as HTMLDivElement).innerHTML)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') { e.preventDefault(); exec('bold') }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') { e.preventDefault(); exec('italic') }
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              // ⌘/Ctrl + Enter → submit form หากมี
              const form = editorRef.current?.closest('form') as HTMLFormElement | null
              if (form) {
                e.preventDefault()
                form.requestSubmit()
              }
            }
          }}
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{ __html: defaultHTML || '' }}
        />

        {/* Placeholder overlay */}
        {placeholderVisible && (
          <div className="pointer-events-none absolute inset-0 select-none p-5 text-white/40" style={{ minHeight }}>
            {placeholder}
          </div>
        )}
      </div>

      {/* Hidden input for form submit */}
      <input ref={inputRef} type="hidden" name={name} defaultValue={defaultHTML} />
    </div>
  )

  function onInsertLink() {
    const url = prompt('ใส่ URL ที่ต้องการลิงก์ไป:')?.trim()
    if (!url) return
    try {
      const u = new URL(url, window.location.origin)
      exec('createLink', u.toString())
    } catch {}
  }

  function onInsertImage() {
    const url = prompt('ใส่ URL รูปภาพ (https://...)')?.trim()
    if (!url) return
    try {
      const u = new URL(url, window.location.origin)
      exec('insertImage', u.toString())
    } catch {}
  }
}

/**
 * sanitizeHTML – ทำความสะอาด HTML (whitelist) สำหรับประกาศ/บล็อก
 */
function sanitizeHTML(input: string): string {
  try {
    const allowedTags = new Set([
      'p','br','strong','b','em','i','u','s','a','ul','ol','li','h2','h3','blockquote','img','code','pre','hr'
    ])
    const allowedAttrs = new Set(['href','target','rel','src','alt'])

    const doc = new DOMParser().parseFromString(`<div>${input}</div>`, 'text/html')
    const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT, null)

    const toRemove: Element[] = []
    const sanitizeElement = (el: Element) => {
      if (!allowedTags.has(el.tagName.toLowerCase())) {
        toRemove.push(el)
        return
      }
      for (const attr of Array.from(el.attributes)) {
        if (!allowedAttrs.has(attr.name.toLowerCase())) el.removeAttribute(attr.name)
      }
      if (el.tagName.toLowerCase() === 'a') {
        const a = el as HTMLAnchorElement
        if (a.href && !a.target) a.target = '_blank'
        a.rel = 'noopener noreferrer'
      }
      if (el.tagName.toLowerCase() === 'img') {
        const im = el as HTMLImageElement
        if (!/^https?:\/\//i.test(im.src)) im.remove()
        im.removeAttribute('width')
        im.removeAttribute('height')
        im.setAttribute('loading', 'lazy')
        im.style.maxWidth = '100%'
        im.style.height = 'auto'
      }
      el.removeAttribute('onerror')
      el.removeAttribute('onclick')
      el.removeAttribute('onload')
    }

    let current = walker.currentNode as Element | null
    while (current) {
      sanitizeElement(current)
      current = walker.nextNode() as Element | null
    }
    toRemove.forEach((el) => el.replaceWith(...Array.from(el.childNodes)))

    return doc.body.innerHTML.replace(/^<div>|<\/div>$/g, '')
  } catch {
    const div = document.createElement('div')
    div.textContent = input
    return `<p>${div.innerHTML}</p>`
  }
}

function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
