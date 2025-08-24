"use client";

type Props = {
  confirmText: string;
  className?: string;
  children: React.ReactNode;
};

export default function ConfirmSubmit({ confirmText, className, children }: Props) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}