export function ThemeToggle({
  themeOn,
  onToggle,
}: {
  themeOn: boolean;
  onToggle: () => void;
}) {
  const label = themeOn ? 'Stop music' : 'Play music';
  return (
    <button
      className="btn btn--ghost btn--icon"
      aria-pressed={themeOn}
      aria-label={label}
      title={label}
      onClick={onToggle}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
        shapeRendering="crispEdges"
      >
        <path fill="currentColor" d="M2 9h4l5-4v14l-5-4H2z" />
        {themeOn ? (
          <g fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 8.5a5 5 0 0 1 0 7" />
            <path d="M18 5.5a10 10 0 0 1 0 13" />
          </g>
        ) : (
          <g fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 9l6 6" />
            <path d="M21 9l-6 6" />
          </g>
        )}
      </svg>
    </button>
  );
}
