const icons = {
  chip: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 12h2" />
      <path d="M4 12h2" />
      <path d="M12 18v2" />
      <path d="M12 4v2" />
      <path d="M16.24 7.76l1.42-1.42" />
      <path d="M6.34 17.66l1.42-1.42" />
      <path d="M17.66 17.66l-1.42-1.42" />
      <path d="M7.76 7.76L6.34 6.34" />
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <path d="M10 10h4v4h-4z" />
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      <circle cx="12" cy="16" r="1" />
      <path d="M12 16v2" />
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
    </svg>
  ),
  brain: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 4c-.68 0-1.3.2-1.82.54A4.2 4.2 0 0 0 5.5 8.5c0 .95.32 1.82.86 2.52" />
      <path d="M14.5 4c.68 0 1.3.2 1.82.54A4.2 4.2 0 0 1 18.5 8.5c0 .95-.32 1.82-.86 2.52" />
      <path d="M9.5 20c-.68 0-1.3-.2-1.82-.54A4.2 4.2 0 0 1 5.5 15.5c0-.95.32-1.82.86-2.52" />
      <path d="M14.5 20c.68 0 1.3-.2 1.82-.54A4.2 4.2 0 0 0 18.5 15.5c0-.95-.32-1.82-.86-2.52" />
      <path d="M9 12h6" />
      <path d="M12 9v6" />
    </svg>
  ),
  globe: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  bolt: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L4.09 12.11a.1.1 0 0 0 .07.17h6.34l-2.99 7.88a.1.1 0 0 0 .17.09L19.91 10a.1.1 0 0 0-.08-.17h-6.35l2.99-7.87a.1.1 0 0 0-.17-.09z" />
    </svg>
  ),
}

export function Icon({ name, className = '', ariaLabel }) {
  return (
    <span className={`icon ${className}`} aria-label={ariaLabel} aria-hidden={!ariaLabel} role="img">
      {icons[name] || null}
    </span>
  )
}
