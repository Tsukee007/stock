export default function Logo({ showText = true, size = 40 }: { showText?: boolean; size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.25,
          background: '#1D4ED8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg width={size * 0.54} height={size * 0.54} viewBox="0 0 24 24" fill="none">
          <path d="M4 11L12 4L20 11" stroke="#E86A33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="6.5" y="11" width="11" height="9" rx="1.2" stroke="#FFFFFF" strokeWidth="1.8" />
          <line x1="12" y1="11" x2="12" y2="20" stroke="#FFFFFF" strokeWidth="1.4" />
        </svg>
      </div>
      {showText && (
        <span
          style={{
            fontSize: size * 0.55,
            fontWeight: 500,
            letterSpacing: '-0.3px',
            color: '#0F172A',
          }}
        >
          nestock
        </span>
      )}
    </div>
  )
}
