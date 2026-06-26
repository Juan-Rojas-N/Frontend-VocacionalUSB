import { useState } from 'react'

const cards = [
  {
    id: 1,
    title: 'Registro',
    image: '/guide/imag-tarjeta-1.png',
    text: 'Crea tu cuenta proporcionando información básica para personalizar tu experiencia.',
  },
  {
    id: 2,
    title: 'Prueba vocacional',
    image: '/guide/imag-tarjeta-2.png',
    text: 'Responderás preguntas diseñadas para evaluar intereses, habilidades y preferencias.',
  },
  {
    id: 3,
    title: 'Recomendaciones',
    image: '/guide/imag-tarjeta-3.png',
    text: 'Contesta con sinceridad, sin estímulos externos y con la calma suficiente para decidir bien.',
  },
  {
    id: 4,
    title: 'Resultados',
    image: '/guide/imag-tarjeta-4.png',
    text: 'Obtén un análisis inicial y programas sugeridos de acuerdo con tus respuestas.',
  },
]

export function GuideCardCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const card = cards[currentIndex]

  function move(step: number) {
    setCurrentIndex((value) => (value + step + cards.length) % cards.length)
  }

  return (
    <div className="guide-carousel">
      <div className="guide-carousel__card">
        <div className="guide-carousel__header">
          <div className="guide-carousel__badge">{card.id}</div>
          <div className="guide-carousel__meta">
            <span>Guía paso a paso</span>
            <h3>{card.title}</h3>
          </div>
        </div>
        <div className="guide-carousel__image-shell">
          <img src={card.image} alt="" aria-hidden="true" className="guide-carousel__image guide-carousel__image--icon" />
        </div>
        <p>{card.text}</p>
        <div className="guide-carousel__footer">
          <button
            type="button"
            className="guide-carousel__arrow"
            onClick={() => move(-1)}
            aria-label="Tarjeta anterior"
          >
            {'<'}
          </button>
          <div className="guide-carousel__dots">
            {cards.map((item, index) => (
              <span
                key={item.id}
                className={
                  index === currentIndex
                    ? 'guide-carousel__dot guide-carousel__dot--active'
                    : 'guide-carousel__dot'
                }
              />
            ))}
          </div>
          <button
            type="button"
            className="guide-carousel__arrow"
            onClick={() => move(1)}
            aria-label="Tarjeta siguiente"
          >
            {'>'}
          </button>
        </div>
      </div>
    </div>
  )
}
