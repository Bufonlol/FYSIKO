import { useState } from 'react'
import { Icon } from '../ui/Icon'

const STORAGE_KEY = 'guia-resultados-oculta'

function readHidden(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) === '1' } catch { return false }
}

// Guía breve que explica cómo marcar el resultado de cada cita, del que
// dependen las métricas de asistencia, efectividad y ocupación. Se puede
// ocultar y recuerda la preferencia en el navegador.
export function GuiaResultados() {
  const [hidden, setHidden] = useState(readHidden)
  if (hidden) return null

  function dismiss() {
    setHidden(true)
    try { localStorage.setItem(STORAGE_KEY, '1') } catch { /* modo privado: sin persistencia */ }
  }

  return (
    <section className='guia-resultados' aria-label='Cómo registrar el resultado de las citas'>
      <div className='guia-resultados-head'>
        <div className='guia-resultados-icon' aria-hidden='true'>
          <Icon name='reports' size={18} />
        </div>
        <div className='guia-resultados-copy'>
          <strong>Para que la asistencia y la efectividad se llenen solas</strong>
          <p>Marca el resultado de cada cita cuando termine. Toma unos segundos y alimenta todos los reportes.</p>
        </div>
        <button type='button' className='guia-resultados-close' aria-label='Ocultar guía' onClick={dismiss}>×</button>
      </div>
      <ol className='guia-resultados-steps'>
        <li><span>1</span> Ve a <strong>Agenda</strong> y toca la cita que ya ocurrió.</li>
        <li><span>2</span> En <strong>“Resultado final”</strong> elige: <strong>Asistió</strong>, <strong>No asistió</strong>, <strong>Reagendó</strong> o <strong>Canceló</strong>.</li>
        <li><span>3</span> Listo: la asistencia, la efectividad y la ocupación de este panel se actualizan automáticamente.</li>
      </ol>
    </section>
  )
}
