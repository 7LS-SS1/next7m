export function ToolbarButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    "inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 font-medium hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed";
  return <button {...props} className={`${base} ${props.className ?? ""}`} />;
}