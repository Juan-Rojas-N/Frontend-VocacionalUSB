import { Link } from 'react-router-dom'
import { APP_ROUTES } from '../../constants'

export function LandingPage() {
  return (
    <div className="landing-shell">
      <section className="landing-hero">
        <div className="landing-hero__inner">
          <h1>Descubre tu camino académico y profesional con mayor claridad</h1>
          <p>
            La plataforma de orientación vocacional de la Universidad de San Buenaventura sede
            de Bogotá te ayuda a identificar intereses, habilidades y afinidades profesionales
            mediante pruebas, resultados guiados y recomendaciones académicas personalizadas.
          </p>
          <Link to={APP_ROUTES.testIntro} className="landing-hero__cta">
            Iniciar Prueba
          </Link>
        </div>
      </section>

      <section className="landing-steps" aria-label="Cómo funciona la prueba vocacional">
        <h2>¿Cómo funciona la prueba vocacional?</h2>
        <div className="landing-steps__grid">
          <article className="landing-step-card">
            <div className="landing-step-card__number">1</div>
            <h3>Registro</h3>
            <p>Crea tu cuenta proporcionando información básica para personalizar tu experiencia</p>
          </article>
          <article className="landing-step-card">
            <div className="landing-step-card__number">2</div>
            <h3>Prueba Vocacional</h3>
            <p>
              Responde x preguntas diseñadas para evaluar tus intereses, habilidades y
              preferencias <span>(estimado de duración 40 minutos).</span>
            </p>
          </article>
          <article className="landing-step-card">
            <div className="landing-step-card__number">3</div>
            <h3>Resultados</h3>
            <p>
              Obtén un análisis y opciones de carreras recomendadas de acuerdo a las respuestas
              brindadas.
            </p>
          </article>
        </div>
      </section>

      <section className="landing-about">
        <div className="landing-about__inner">
          <h2>Universidad de San Buenaventura sede de Bogotá</h2>
          <p>
            Institución comprometida con la información integral de profesionales competentes,
            éticos y con sentido social. Nuestra prueba vocacional está respaldada por
            metodologías científicas validadas que te ayudaran a darte una primera guía de tu
            decisión de vida académica.
          </p>
        </div>
      </section>
    </div>
  )
}
