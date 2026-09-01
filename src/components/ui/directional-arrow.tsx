export function DirectionalArrow({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path d="M3.5 10h13M12 5.5l4.5 4.5-4.5 4.5" />
    </svg>
  );
}
