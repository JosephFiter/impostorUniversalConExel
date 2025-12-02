// src/pages/Juegocompetitivo.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'

export default function Juegocompetitivo() {
  const navigate = useNavigate()

  const [totalJugadores, setTotalJugadores] = useState(10)
  const [objetivo, setObjetivo] = useState('')
  const [impostoresIndices, setImpostoresIndices] = useState([])
  const [indiceActual, setIndiceActual] = useState(0)
  const [mostrarRol, setMostrarRol] = useState(false)
  const [juegoIniciado, setJuegoIniciado] = useState(false)  // ← NUEVO: pantalla final

  useEffect(() => {
    const jugadores = parseInt(localStorage.getItem('jugadoresTotales') || '10')
    const objetivoGuardado = localStorage.getItem('objetivoGlobal')
    const indicesGuardados = JSON.parse(localStorage.getItem('impostoresIndices') || '[]')

    if (!objetivoGuardado || indicesGuardados.length === 0) {
      alert('Error de configuración')
      navigate('/')
      return
    }

    setTotalJugadores(jugadores)
    setObjetivo(objetivoGuardado)
    setImpostoresIndices(indicesGuardados)
  }, [navigate])

  const esImpostor = impostoresIndices.includes(indiceActual)

  const siguiente = () => {
    if (indiceActual < totalJugadores - 1) {
      setMostrarRol(false)
      setIndiceActual(indiceActual + 1)
    } else {
      // Último jugador → mostrar pantalla final
      setJuegoIniciado(true)
    }
  }

  // Si ya terminó
  if (juegoIniciado) {
    return (
      <div className="container juego-screen final">
        <div className="fondo-rojo"></div>
        
        <h1 className="titulo inicio-juego">
          ¡QUE COMIENCE EL JUEGO!
        </h1>

        <div className="contador-impostores">
          Hay {localStorage.getItem('impostoresTotales')} impostor/es entre ustedes
        </div>

        <button 
          className="btn-terminar" 
          onClick={() => navigate('/')}
        >
          TERMINAR JUEGO
        </button>
      </div>
    )
  }

  // Pantalla normal de rol
  return (
    <div className="container juego-screen">
      <h1 className="titulo gran">TU TURNO</h1>

      <div className="progreso">
        Jugador {indiceActual + 1} de {totalJugadores}
      </div>

      {!mostrarRol ? (
        <div className="centro">
          <p className="instruccion">Toca cuando estés listo/a</p>
          <button className="btn-grande" onClick={() => setMostrarRol(true)}>
            MOSTRAR ROL
          </button>
        </div>
      ) : (
        <div className="rol-revelado">
          {esImpostor ? (
            <h2 className="impostor grande">¡ERES EL IMPOSTOR!</h2>
          ) : (
            <>
              <h2 className="tripulante">Tu objetivo es proteger a:</h2>
              <h1 className="objetivo-nombre">{objetivo}</h1>
            </>
          )}

          <p className="nombre-jugador">
            Jugador {indiceActual + 1}
          </p>

          <button className="btn-siguiente" onClick={siguiente}>
            {indiceActual < totalJugadores - 1 ? 'SIGUIENTE →' : 'INICIAR JUEGO'}
          </button>
        </div>
      )}
    </div>
  )
}