import { useState } from 'react'
import {
  Activity, ArrowRight, Bone, CalendarDays, ChevronDown, ChevronRight,
  CircleCheck, Dumbbell, MapPin, Menu, MessageCircle,
  Phone, ShieldCheck, Stethoscope, Target, Users, X,
} from 'lucide-react'
import './Landing.css'

const whatsapp = 'https://wa.me/522723565429?text=Hola%20FYSIKO%2C%20quiero%20agendar%20una%20valoraci%C3%B3n.'

function Brand({ dark = false }: { dark?: boolean }) {
  return <a className={`fy-brand ${dark ? 'is-dark' : ''}`} href="#inicio" aria-label="FYSIKO, inicio">
    <span className="fy-bolt" aria-hidden="true"><i /><i /></span><b>FYSIKO.</b>
  </a>
}

const limits = [
  ['Espalda', 'Dolor lumbar y postura', 'therapy-senior.webp'], ['Rodilla', 'Lesiones y dolor al caminar', 'hero-therapy.webp'],
  ['Hombro', 'Molestias y lesiones', 'therapy-balance.webp'], ['Cuello', 'Tensión y dolor cervical', 'therapy-walk.webp'],
  ['Lesiones deportivas', 'Recupera tu rendimiento', 'therapy-balance.webp'], ['Movilidad limitada', 'Recupera tu independencia', 'therapy-senior.webp'],
]

const services = [
  ['Fisioterapia general', 'Evaluación y tratamiento personalizado para diversas condiciones.', Stethoscope, 'hero-therapy.webp'],
  ['Rehabilitación deportiva', 'Acompañamiento para regresar a tu actividad de forma segura.', Activity, 'therapy-balance.webp'],
  ['Movilidad y ejercicio terapéutico', 'Mejora tu fuerza, equilibrio y funcionalidad.', Dumbbell, 'therapy-walk.webp'],
  ['Terapias especializadas', 'Técnicas seleccionadas de acuerdo con tu caso y objetivos.', Target, 'therapy-senior.webp'],
]

const steps = [
  ['01', 'Agenda tu valoración', 'Escríbenos por WhatsApp y elige el horario que mejor te funcione.', CalendarDays],
  ['02', 'Evaluamos tu caso', 'Revisamos tu movilidad, dolor, antecedentes y objetivos.', Stethoscope],
  ['03', 'Plan personalizado', 'Diseñamos un tratamiento claro y adecuado para ti.', Target],
  ['04', 'Seguimiento', 'Medimos tu avance y ajustamos el plan para recuperar confianza.', Activity],
]

const faqs = [
  ['¿Necesito una valoración antes de iniciar?', 'Sí. Nos permite conocer tu caso, identificar limitaciones y definir un plan seguro y personalizado.'],
  ['¿Cuánto dura una sesión?', 'La duración depende del tratamiento indicado. Al agendar te explicamos el tiempo estimado para tu caso.'],
  ['¿Qué debo llevar a mi cita?', 'Ropa cómoda y, si cuentas con ellos, estudios, recetas o indicaciones médicas relacionadas con tu lesión.'],
  ['¿Atienden lesiones deportivas?', 'Sí. Trabajamos recuperación, readaptación al ejercicio y prevención para volver a entrenar con seguridad.'],
  ['¿Dónde están ubicados?', 'En Norte 6 #911, entre Oriente 17 y 19, Orizaba, Veracruz.'],
]

export function Landing() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [faqOpen, setFaqOpen] = useState(0)
  const close = () => setMenuOpen(false)

  return <main className="fy-site">
    <header className="fy-header">
      <div className="fy-container fy-nav"><Brand />
        <nav className={menuOpen ? 'is-open' : ''} aria-label="Navegación principal">
          <a href="#inicio" onClick={close}>Inicio</a><a href="#servicios" onClick={close}>Servicios</a>
          <a href="#proceso" onClick={close}>Tratamientos</a><a href="#nosotros" onClick={close}>Nosotros</a>
          <a href="#contacto" onClick={close}>Contacto</a>
          <a className="fy-nav-cta" href={whatsapp} target="_blank" rel="noreferrer"><CalendarDays size={17}/> Agendar valoración</a>
        </nav>
        <button className="fy-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menú">{menuOpen ? <X/> : <Menu/>}</button>
      </div>
    </header>

    <section className="fy-hero" id="inicio">
      <img src="/fysiko/hero-therapy.webp" alt="Fisioterapeuta evaluando la rodilla de un paciente" />
      <div className="fy-hero-shade"/><div className="fy-container fy-hero-content">
        <p className="fy-eyebrow">Fisioterapia en Orizaba</p>
        <h1>Recupera tu<br/><em>movimiento.</em><span>Vuelve a sentirte bien.</span></h1>
        <p className="fy-lead">Fisioterapia y rehabilitación personalizada para ayudarte a superar lesiones, reducir el dolor y mejorar tu calidad de vida.</p>
        <div className="fy-actions"><a className="fy-btn fy-btn-primary" href={whatsapp} target="_blank" rel="noreferrer">Agendar valoración <CalendarDays size={18}/></a><a className="fy-btn fy-btn-ghost" href="#servicios">Conocer servicios <ArrowRight size={18}/></a></div>
      </div>
      <div className="fy-container fy-proof"><span><Users/> Atención personalizada</span><span><Activity/> Rehabilitación y movilidad</span><span><MapPin/> En Orizaba, Veracruz</span></div>
    </section>

    <section className="fy-section fy-limits"><div className="fy-container">
      <div className="fy-section-head centered"><p className="fy-kicker">Empieza por lo que sientes</p><h2>¿Qué te impide <em>moverte como antes?</em></h2><p>Identifica la zona de molestia y conoce cómo podemos ayudarte.</p></div>
      <div className="fy-limit-grid">{limits.map(([name, desc, image]) => <a href={whatsapp} target="_blank" rel="noreferrer" className="fy-limit" key={name}>
        <img src={`/fysiko/${image}`} alt=""/><div><b>{name}</b><small>{desc}</small></div><ChevronRight/>
      </a>)}</div>
    </div></section>

    <section className="fy-section fy-services" id="servicios"><div className="fy-container">
      <div className="fy-section-head row"><div><p className="fy-kicker">Atención enfocada en ti</p><h2>Nuestros <em>servicios</em></h2><p>Tratamientos enfocados en tus necesidades y objetivos.</p></div><Brand dark/></div>
      <div className="fy-service-grid">{services.map(([name, desc, Icon, image]) => { const I = Icon as typeof Activity; return <article className="fy-service" key={name as string}><div className="fy-service-img"><img src={`/fysiko/${image}`} alt=""/></div><div className="fy-service-copy"><I/><h3>{name as string}</h3><p>{desc as string}</p><a href={whatsapp}>Conocer servicio <ArrowRight/></a></div></article>})}</div>
    </div></section>

    <section className="fy-process" id="proceso"><div className="fy-container"><div className="fy-process-head"><p className="fy-kicker">Tu recuperación, paso a paso</p><h2>Empieza con una buena <em>evaluación</em></h2><p>Un proceso simple, claro y enfocado en ti.</p></div><div className="fy-step-grid">{steps.map(([n,title,desc,Icon]) => { const I=Icon as typeof Activity; return <article className="fy-step" key={n as string}><I/><strong>{n as string}</strong><h3>{title as string}</h3><p>{desc as string}</p></article>})}</div></div></section>

    <section className="fy-about fy-section" id="nosotros"><div className="fy-container fy-about-grid"><div className="fy-about-photo"><img src="/fysiko/therapy-walk.webp" alt="Sesión de rehabilitación en FYSIKO"/><span>Movimiento hoy.<br/>Una mejor mañana.</span></div><div className="fy-about-copy"><p className="fy-kicker">Conoce FYSIKO</p><h2>Tratamiento personalizado.<br/><em>Atención humana.</em></h2><p>Cada persona llega con una historia, una actividad y objetivos diferentes. En FYSIKO nos enfocamos en escucharte, entender tu caso y acompañarte en tu proceso de recuperación.</p><ul><li><ShieldCheck/> Formación profesional</li><li><Users/> Atención cercana</li><li><Target/> Enfoque en resultados</li></ul><a className="fy-btn fy-btn-dark" href={whatsapp}>Cuéntanos tu caso <ArrowRight/></a></div></div></section>

    <section className="fy-sport"><div className="fy-container fy-sport-grid"><div><p className="fy-kicker">Rehabilitación deportiva</p><h2>¿Te duele entrenar?<br/><em>No lo ignores.</em></h2><p>Una molestia puede cambiar la forma en que entrenas. Una valoración puede ayudarte a entender qué ocurre y definir el siguiente paso.</p><a className="fy-btn fy-btn-primary" href={whatsapp}>Agendar valoración deportiva <ArrowRight/></a></div><ul><li><CircleCheck/> Corre con menos dolor</li><li><CircleCheck/> Mejora tu rendimiento</li><li><CircleCheck/> Previene lesiones</li><li><CircleCheck/> Entrena con seguridad</li></ul></div></section>

    <section className="fy-section fy-stages"><div className="fy-container"><div className="fy-section-head centered"><p className="fy-kicker">Fisioterapia para todos</p><h2>Atención para <em>distintas etapas de vida</em></h2></div><div className="fy-stage-grid">{[
      ['Deportistas','Rendimiento y prevención de lesiones.','therapy-balance.webp'],['Adultos','Recupera funcionalidad en tu día a día.','hero-therapy.webp'],['Adultos mayores','Mejora tu movilidad y calidad de vida.','therapy-senior.webp'],['Postoperatorio','Regresa a tus actividades de forma segura.','therapy-walk.webp']
    ].map(x=><article key={x[0]}><img src={`/fysiko/${x[2]}`} alt=""/><h3>{x[0]}</h3><p>{x[1]}</p></article>)}</div></div></section>

    <section className="fy-testimonials fy-section"><div className="fy-container"><div className="fy-section-head centered"><p className="fy-kicker">Historias de recuperación</p><h2>Personas que volvieron a moverse <em>con más confianza</em></h2></div><div className="fy-quotes">{[
      ['“Llegué con mucho dolor en la rodilla y hoy puedo volver a correr. La atención es excelente y el progreso se nota.”','Carlos M.','Lesión de rodilla'],['“Me ayudaron muchísimo con mi dolor de espalda. Ahora tengo mejor postura y menos molestias.”','Ana R.','Dolor lumbar'],['“Profesional, atento y siempre explica todo muy bien. Totalmente recomendado.”','Luis G.','Rehabilitación deportiva']
    ].map(q=><blockquote key={q[1]}><span>“</span><p>{q[0]}</p><footer><b>{q[1]}</b><small>{q[2]}</small></footer></blockquote>)}</div></div></section>

    <section className="fy-contact fy-section" id="contacto"><div className="fy-container fy-contact-grid"><div><p className="fy-kicker">Estamos cerca de ti</p><h2>Visítanos en <em>Orizaba</em></h2><p>Atención profesional en un espacio preparado para acompañar tu recuperación.</p><div className="fy-contact-list"><a href="https://maps.google.com/?q=Nte.+6+911,+Orizaba,+Veracruz" target="_blank" rel="noreferrer"><MapPin/><span><b>Dirección</b>Nte. 6 #911, entre Oriente 17 y 19<br/>Orizaba, Veracruz</span></a><a href="tel:+522723565429"><Phone/><span><b>Teléfono / WhatsApp</b>272 356 5429</span></a><div><CalendarDays/><span><b>Horario</b>Lunes a viernes, desde las 9:00 a. m.</span></div></div><a className="fy-btn fy-btn-primary" href={whatsapp}><MessageCircle/> Agendar por WhatsApp</a></div><a className="fy-location" href="https://maps.google.com/?q=Nte.+6+911,+Orizaba,+Veracruz" target="_blank" rel="noreferrer"><img src="/fysiko/clinic-front.webp" alt="Ubicación de FYSIKO en Orizaba"/><span><MapPin/> Ver ubicación en Google Maps</span></a></div></section>

    <section className="fy-faq fy-section"><div className="fy-container fy-faq-grid"><div><p className="fy-kicker">Resolvemos tus dudas</p><h2>Preguntas <em>frecuentes</em></h2><p>Si tu duda no aparece aquí, escríbenos. Con gusto te orientamos.</p></div><div>{faqs.map(([q,a],i)=><article className={faqOpen===i?'is-open':''} key={q}><button onClick={()=>setFaqOpen(faqOpen===i?-1:i)} aria-expanded={faqOpen===i}><span>{q}</span><ChevronDown/></button><p>{a}</p></article>)}</div></div></section>

    <section className="fy-final"><div className="fy-container"><div><p>No tienes que esperar</p><h2>A que el dolor te detenga.</h2><span>Agenda una valoración y da el primer paso hacia una mejor calidad de vida.</span></div><div className="fy-actions"><a className="fy-btn fy-btn-whatsapp" href={whatsapp}><MessageCircle/> Agendar por WhatsApp</a><a className="fy-btn fy-btn-ghost" href="tel:+522723565429"><Phone/> Llamar ahora</a></div></div></section>

    <footer className="fy-footer"><div className="fy-container"><div><Brand/><p>Movimiento hoy.<br/>Una mejor mañana.</p></div><div><b>Enlaces</b><a href="#servicios">Servicios</a><a href="#proceso">Tratamientos</a><a href="#nosotros">Nosotros</a></div><div><b>Contacto</b><a href="tel:+522723565429">272 356 5429</a><span>Orizaba, Veracruz</span><div className="fy-social"><a aria-label="Instagram" href="https://instagram.com/fysiko.rhb">IG</a><a aria-label="Facebook" href="#">FB</a></div></div></div><div className="fy-container fy-legal"><span>© {new Date().getFullYear()} FYSIKO. Todos los derechos reservados.</span><a href="/admin">Acceso administrativo</a></div></footer>
    <a className="fy-floating" href={whatsapp} aria-label="Agendar por WhatsApp"><MessageCircle/></a>
  </main>
}
