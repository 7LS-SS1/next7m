"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";

/**
 * RichText editor (TipTap) with optional form integration.
 *
 * If `name` is provided, the component will render a hidden `<input type="hidden" name={name} />`
 * and keep it synced with the editor's HTML. This allows native `<form>` submissions to include
 * the rich text content without additional client code.
 */

type Props = {
  /** Optional form field name. If provided, a hidden input will be rendered and kept in sync. */
  name?: string;
  /** Initial/current HTML value. */
  value?: string; // HTML
  /** Callback on change (receives HTML). */
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
};

export default function RichText({
  name,
  value = "",
  onChange,
  placeholder,
  className,
}: Props) {
  // Internal mirror state so we can both control TipTap and keep a hidden input in sync
  const [val, setVal] = useState<string>(value || "");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
        codeBlock: { HTMLAttributes: { class: "rt-code" } },
      }),
      Link.configure({
        openOnClick: true,
        autolink: true,
        protocols: ["http", "https", "mailto", "tel"],
        validate: (href) => /^https?:\/\/|^mailto:|^tel:/.test(href),
      }),
      Image.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({
        placeholder: placeholder || "เขียนรายละเอียด/คำอธิบายได้ที่นี่…",
      }),
    ],
    content: val,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setVal(html);
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        class:
          "tiptap prose prose-invert max-w-none focus:outline-none min-h-[200px]",
      },
    },
  });

  // Keep editor/content in sync when `value` prop changes from the outside
  useEffect(() => {
    if (!editor) return;
    if (value != null && value !== val) {
      editor.commands.setContent(value, { emitUpdate: false });
      setVal(value);
    }
  }, [value, editor]);

  return (
    <div className={className}>
      {/* Toolbar */}
      <div className="mb-2 flex flex-wrap gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
        <Btn onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive("bold")}>
          B
        </Btn>
        <Btn onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive("italic")}>
          I
        </Btn>
        <Btn onClick={() => editor?.chain().focus().toggleStrike().run()} active={editor?.isActive("strike")}>
          S
        </Btn>
        <Sep />
        <Btn
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor?.isActive("heading", { level: 2 })}
        >
          H2
        </Btn>
        <Btn
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor?.isActive("heading", { level: 3 })}
        >
          H3
        </Btn>
        <Sep />
        <Btn onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive("bulletList")}>
          • List
        </Btn>
        <Btn onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive("orderedList")}>
          1. List
        </Btn>
        <Sep />
        <Btn onClick={() => editor?.chain().focus().toggleCodeBlock().run()} active={editor?.isActive("codeBlock")}>
          {"</>"}
        </Btn>
        <Btn
          onClick={() => {
            const url = prompt("ใส่ลิงก์ (ต้องขึ้นต้นด้วย http/https):") || "";
            if (!url) return;
            editor?.chain().focus().setLink({ href: url }).run();
          }}
        >
          Link
        </Btn>
        <Btn onClick={() => editor?.chain().focus().unsetLink().run()}>Unlink</Btn>
        <Sep />
        <Btn
          onClick={() => {
            const url = prompt("ใส่ URL ของรูปภาพ หรือ base64 data-uri:");
            if (url) editor?.chain().focus().setImage({ src: url }).run();
          }}
        >
          🖼️ รูป
        </Btn>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          id="upload-image"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const fd = new FormData();
            fd.append("file", f);

            const res = await fetch("/api/upload", { method: "POST", body: fd });
            const json = await res.json();
            if (json.url) {
              editor?.chain().focus().setImage({ src: json.url }).run();
            }
          }}
        />
        <label htmlFor="upload-image" className="cursor-pointer rounded-md px-2 py-1 text-sm hover:bg-white/10">
          📤 Upload รูป
        </label>

        <Btn onClick={() => editor?.chain().focus().redo().run()}>↻</Btn>
      </div>

      {/* Editor */}
      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
        <EditorContent editor={editor} />
      </div>

      {/* Hidden input for form submission when `name` provided */}
      {name ? <input type="hidden" name={name} value={val} /> : null}
    </div>
  );
}

function Btn({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-md px-2 py-1 text-sm " + (active ? "bg-white/20" : "hover:bg-white/10")
      }
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="mx-1 h-5 w-px bg-white/10" />;
}
