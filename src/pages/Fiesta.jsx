// src/pages/Fiesta.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'

export default function Fiesta() {
  const navigate = useNavigate()

  const [totalJugadores, setTotalJugadores] = useState(10)
  const [objetivoBase, setObjetivoBase] = useState('')
  const [impostoresIndices, setImpostoresIndices] = useState([])
  const [objetivoEspecial, setObjetivoEspecial] = useState(null) // {indice, nombre}
  const [objetivosDivididos, setObjetivosDivididos] = useState(null) // {nombreA, nombreB}
  const [indiceActual, setIndiceActual] = useState(0)
  const [mostrarRol, setMostrarRol] = useState(false)
  const [juegoIniciado, setJuegoIniciado] = useState(false)

  useEffect(() => {
    const jugadores = parseInt(localStorage.getItem('jugadoresTotales') || '10')
    const objetivo = localStorage.getItem('objetivoGlobal')
    const indices = JSON.parse(localStorage.getItem('impostoresIndices') || '[]')
    const especial = localStorage.getItem('objetivoEspecial')
    const divididos = localStorage.getItem('objetivosDivididos')

    if (!objetivo || indices.length === undefined) {
      alert('Error de configuración')
      navigate('/')
      return
    }

    setTotalJugadores(jugadores)
    setObjetivoBase(objetivo)
    setImpostoresIndices(indices)
    if (especial) setObjetivoEspecial(JSON.parse(especial))
    if (divididos) setObjetivosDivididos(JSON.parse(divididos))
  }, [navigate])

  const esImpostor = impostoresIndices.includes(indiceActual)

  // Determinar qué nombre mostrar
  const obtenerObjetivoParaJugador = () => {
    if (objetivoEspecial && objetivoEspecial.indice === indiceActual) {
      return objetivoEspecial.nombre
    }
    if (objetivosDivididos) {
      // Mitad y mitad (redondea hacia abajo)
      const mitad = Math.floor(totalJugadores / 2)
      return indiceActual < mitad ? objetivosDivididos.nombreA : objetivosDivididos.nombreB
    }
    return objetivoBase
  }

  const siguiente = () => {
    if (indiceActual < totalJugadores - 1) {
      setMostrarRol(false)
      setIndiceActual(indiceActual + 1)
    } else {
      setJuegoIniciado(true)
    }
  }

  if (juegoIniciado) {
    return (
      <div className="container juego-screen final">
        <div className="fondo-rojo"></div>
        
        <h1 className="titulo inicio-juego fiesta-titulo">
          ¡FIESTA MODE ACTIVADO!
        </h1>

        <div className="contador-impostores fiesta">
          Hay {localStorage.getItem('impostoresTotales')} impostor/es entre ustedes... ¿o no?
        </div>

        <button 
          className="btn-terminar fiesta" 
          onClick={() => navigate('/')}
        >
          TERMINAR FIESTA
        </button>
      </div>
    )
  }

  return (
    <div className="container juego-screen fiesta-bg">
      <h1 className="titulo gran fiesta-titulo">¡TU TURNO!</h1>

      <div className="progreso">
        Jugador {indiceActual + 1} de {totalJugadores}
      </div>

      {!mostrarRol ? (
        <div className="centro">
          <p className="instruccion">Toca cuando estés listo/a para el caos</p>
          <button className="btn-grande fiesta" onClick={() => setMostrarRol(true)}>
            MOSTRAR ROL
          </button>
        </div>
      ) : (
        <div className="rol-revelado">
          {esImpostor ? (
            <h2 className="impostor grande">¡ERES EL IMPOSTOR!</h2>
          ) : (
            <>
              <h2 className="tripulante fiesta-texto">El personaje es:</h2>
              <h1 className="objetivo-nombre fiesta-objetivo">
                {obtenerObjetivoParaJugador()}
              </h1>
            </>
          )}

          <p className="nombre-jugador">
            Jugador {indiceActual + 1}
          </p>

          <button className="btn-siguiente fiesta" onClick={siguiente}>
            {indiceActual < totalJugadores - 1 ? 'SIGUIENTE →' : '¡A LA FIESTA!'}
          </button>
        </div>
      )}
    </div>
  )
}