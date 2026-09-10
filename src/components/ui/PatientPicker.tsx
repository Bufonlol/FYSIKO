import React, { useState, useEffect, useRef } from 'react'

interface PatientLike {
  id: number
  name: string
  phone?: string
  age?: number
}

interface Props {
  patients: PatientLike[]
  value: string
  onSelect: (id: number, name: string) => void
  style?: React.CSSProperties
  placeholder?: string
}

function highlight(text: string, query: string) {
  if (!query.trim()) return <span>{text}</span>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <span>{text}</span>
  return (
    <span>
      {text.slice(0, idx)}
      <mark style={{ background: '#dbeafe', color: '#1e40af', borderRadius: 2, padding: '0 1px' }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </span>
  )
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
}

const AVATAR_COLORS = ['#5b84b1','#8db84a','#e07b54','#7c5cbf','#e9c46a','#2a9d8f']
function avatarColor(id: number) { return AVATAR_COLORS[id % AVATAR_COLORS.length] }

export function PatientPicker({ patients, value, onSelect, style, placeholder = 'Buscar paciente por nombre…' }: Props) {
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(!!value)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setQuery(value); setSelected(!!value) }, [value])

  const filtered = query.trim() === ''
    ? patients.slice(0, 50)
    : patients.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 50)

  function handleSelect(p: PatientLike) {
    onSelect(p.id, p.name)
    setQuery(p.name)
    setSelected(true)
    setOpen(false)
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    onSelect(0, '')
    setQuery('')
    setSelected(false)
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 36px 9px 36px',
    borderRadius: 8,
    border: open ? '1.5px solid #5b84b1' : '1.5px solid #e2e8f0',
    fontSize: 13,
    color: '#1a2535',
    outline: 'none',
    boxSizing: 'border-box',
    background: selected ? '#f0f6ff' : '#fff',
    transition: 'border-color 0.15s, background 0.15s',
    ...style,
    // override padding from style prop
    paddingLeft: 36,
    paddingRight: selected ? 36 : 12,
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Search icon */}
      <svg
        style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', flexShrink: 0 }}
        width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke={selected ? '#5b84b1' : '#8a9ab0'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      <input
        ref={inputRef}
        value={query}
        onChange={e => { setQuery(e.target.value); setSelected(false); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        style={inputStyle}
        autoComplete="off"
      />

      {/* Clear button */}
      {selected && (
        <button
          onMouseDown={handleClear}
          style={{
            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
            background: '#cbd5e1', border: 'none', borderRadius: '50%',
            width: 18, height: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 12, fontWeight: 700, lineHeight: 1, padding: 0,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#94a3b8' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#cbd5e1' }}
        >×</button>
      )}

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 9999,
          background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 10,
          boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
          maxHeight: 240, overflowY: 'auto',
        }}>
          {filtered.length === 0 && query.trim() !== '' ? (
            <div style={{ padding: '14px 16px', fontSize: 13, color: '#8a9ab0', textAlign: 'center' }}>
              Sin resultados para <strong>"{query}"</strong>
            </div>
          ) : (
            <>
              {query.trim() === '' && (
                <div style={{ padding: '8px 14px 4px', fontSize: 10, fontWeight: 700, color: '#b0bcc8', letterSpacing: '0.5px' }}>
                  TODOS LOS PACIENTES ({patients.length})
                </div>
              )}
              {filtered.map((p, i) => {
                const color = avatarColor(p.id)
                return (
                  <div
                    key={p.id}
                    onMouseDown={() => handleSelect(p)}
                    style={{
                      padding: '9px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                      borderBottom: i < filtered.length - 1 ? '1px solid #f1f5f9' : 'none',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff' }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%', background: color + '22',
                      border: `1.5px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 800, color, flexShrink: 0,
                    }}>
                      {initials(p.name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1a2535', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {highlight(p.name, query)}
                      </div>
                      <div style={{ fontSize: 11, color: '#8a9ab0', marginTop: 1 }}>
                        {[p.age ? `${p.age} años` : null, p.phone].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                  </div>
                )
              })}
              {patients.length > 50 && filtered.length === 50 && (
                <div style={{ padding: '8px 14px', fontSize: 11, color: '#8a9ab0', textAlign: 'center', borderTop: '1px solid #f1f5f9' }}>
                  Escribe para filtrar entre los {patients.length} pacientes
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
