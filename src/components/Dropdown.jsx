// Dropdown — v2.1 selectable list vocabulary.
//
// Closed: pill-shaped trigger matching PillButton secondary. Open: panel
// floats below the trigger. Selected option in the open list takes the
// active clay-fill treatment matching the v2.1 button vocabulary.
//
// Demo-velocity choice: panel floats below on all viewports (no separate
// mobile bottom-sheet). If polish pass wants a bottom-sheet variant on
// small screens, add later — single-implementation now.
//
// Used for ColorScanner facets (Category, Skin Tone, Occasion, Language,
// Shop In) and Landing's consultant selector.
//
// Props:
//   label        — placeholder for the unselected state
//   value        — current selected value (matches one option.value)
//   options      — array of { value, label, icon? }
//   onChange     — (newValue) => void
//   placeholder  — optional override for unselected display text
//   disabled     — boolean, default false

import { useState, useRef, useEffect } from 'react';

const PALETTE = {
  white: '#FFFFFF',
  ink: '#1A1A1A',
  ink55: 'rgba(26,26,26,0.55)',
  clay: '#9C5B4A',
  clayHover: '#8A4F40',
  cream: '#F5F1EA',
  hairline: 'rgba(26,26,26,0.15)',
  hairlineHover: 'rgba(26,26,26,0.4)',
};

const SANS = "'Segoe UI', system-ui, -apple-system, sans-serif";

export default function Dropdown({
  label,
  value,
  options = [],
  onChange,
  placeholder,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [hoverTrigger, setHoverTrigger] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function onEsc(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const selected = options.find(o => o.value === value);
  const displayText = selected?.label || placeholder || label || 'Select';

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => { if (!disabled) setOpen(o => !o); }}
        onMouseEnter={() => { if (!disabled) setHoverTrigger(true); }}
        onMouseLeave={() => setHoverTrigger(false)}
        disabled={disabled}
        style={{
          background: PALETTE.white,
          border: `2px solid ${hoverTrigger ? PALETTE.hairlineHover : PALETTE.hairline}`,
          borderRadius: 999,
          padding: '12px 18px',
          cursor: disabled ? 'default' : 'pointer',
          opacity: disabled ? 0.4 : 1,
          fontSize: 13,
          fontWeight: 600,
          color: selected ? PALETTE.ink : PALETTE.ink55,
          fontFamily: SANS,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          transition: 'border-color 120ms ease',
          minWidth: 120,
          justifyContent: 'space-between',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          {selected?.icon && <span style={{ fontSize: 14, lineHeight: 1 }}>{selected.icon}</span>}
          <span>{displayText}</span>
        </span>
        <span style={{ fontSize: 11, color: PALETTE.clay, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 120ms ease' }}>▾</span>
      </button>

      {open && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            minWidth: '100%',
            background: PALETTE.white,
            border: `1px solid ${PALETTE.hairline}`,
            borderRadius: 14,
            padding: 6,
            boxShadow: '0 6px 24px rgba(26,26,26,0.08)',
            zIndex: 50,
            maxHeight: 280,
            overflowY: 'auto',
            fontFamily: SANS,
          }}
        >
          {options.map(opt => (
            <DropdownItem
              key={opt.value}
              option={opt}
              selected={opt.value === value}
              onSelect={() => {
                onChange?.(opt.value);
                setOpen(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DropdownItem({ option, selected, onSelect }) {
  const [hover, setHover] = useState(false);
  const bg = selected
    ? (hover ? PALETTE.clayHover : PALETTE.clay)
    : (hover ? 'rgba(245,241,234,0.6)' : 'transparent');
  const color = selected ? PALETTE.white : PALETTE.ink;
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%',
        textAlign: 'left',
        background: bg,
        border: 'none',
        borderRadius: 10,
        padding: '10px 14px',
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: selected ? 600 : 500,
        color,
        fontFamily: 'inherit',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        transition: 'background 120ms ease, color 120ms ease',
      }}
    >
      {option.icon && <span style={{ fontSize: 16, lineHeight: 1 }}>{option.icon}</span>}
      <span>{option.label}</span>
    </button>
  );
}
