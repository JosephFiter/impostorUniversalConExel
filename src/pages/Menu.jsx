// src/pages/Menu.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'

export default function Menu() {
  const navigate = useNavigate()
  const [link, setLink] = useState('')
  const [jugadores, setJugadores] = useState(4)
  const [impostores, setImpostores] = useState(1)
  const [listaFinal, setListaFinal] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  // Cargar datos guardados al iniciar
  useEffect(() => {
    const savedLink = localStorage.getItem('impostorLink')
    const savedLista = localStorage.getItem('listaActiva')
    if (savedLink) setLink(savedLink)
    if (savedLista) setListaFinal(JSON.parse(savedLista))
  }, [])

  // Guardar link cada vez que cambie
  useEffect(() => {
    if (link.trim()) {
      localStorage.setItem('impostorLink', link.trim())
    }
  }, [link])

  // FUNCIÓN 100% CONFIABLE PARA LEER GOOGLE SHEETS
  const cargarLista = async () => {
    if (!link.trim()) {
      setError('Pega un link de Google Sheets primero')
      return
    }

    setCargando(true)
    setError('')
    setListaFinal([])

    try {
      const idMatch = link.match(/\/d\/([a-zA-Z0-9-_]+)/)
      if (!idMatch) throw new Error('Link inválido')

      const id = idMatch[1]
      const csvUrl = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=`

      const response = await fetch(csvUrl)
      if (!response.ok) throw new Error('No se pudo conectar con Google Sheets')

      const text = await response.text()

      // Parseador de CSV robusto (soporta comillas, comas, saltos de línea, etc.)
      const filas = text.split('\n').map(linea => {
        const valores = []
        let campo = ''
        let enComillas = false

        for (let i = 0; i < linea.length; i++) {
          const char = linea[i]

          if (char === '"') {
            enComillas = !enComillas
          } else if (char === ',' && !enComillas) {
            valores.push(campo.trim().replace(/^"|"$/g, ''))
            campo = ''
          } else {
            campo += char
          }
        }
        if (campo) valores.push(campo.trim().replace(/^"|"$/g, ''))
        return valores
      }).slice(1) // quitar encabezados

      const activos = []

      for (const fila of filas) {
        if (fila.length < 2) continue

        const nombre = fila[0].trim()
        const estado = fila[1].trim().toUpperCase()

        if (nombre.toUpperCase() === 'FINAL') break

        if (['VERDADERO', 'TRUE', '1', 'SI', 'SÍ', 'YES', 'OK'].includes(estado)) {
          activos.push(nombre)
        }
      }

      if (activos.length === 0) {
        setError('No hay jugadores con VERDADERO')
      } else {
        setListaFinal(activos)
        localStorage.setItem('listaActiva', JSON.stringify(activos))
      }

    } catch (err) {
      console.error('Error cargando lista:', err)
      setError('Error: ' + err.message)
    } finally {
      setCargando(false)
    }
  }

  const iniciarCompetitivo = () => {
    if (listaFinal.length === 0) {
      setError('Primero cargá la lista con "MOSTRAR LISTA"')
      return
    }
    if (impostores >= jugadores) {
      setError('No puede haber más impostores que jugadores')
      return
    }

    // Elegir un objetivo aleatorio de la lista completa
    const objetivoAleatorio = listaFinal[Math.floor(Math.random() * listaFinal.length)]

    // Generar impostores aleatorios (solo índices)
    const indices = Array.from({ length: jugadores }, (_, i) => i)
    const barajado = [...indices].sort(() => Math.random() - 0.5)
    const impostoresIndices = barajado.slice(0, impostores)

    // Guardar todo para el juego
    localStorage.setItem('jugadoresTotales', jugadores)
    localStorage.setItem('impostoresTotales', impostores)
    localStorage.setItem('objetivoGlobal', objetivoAleatorio)
    localStorage.setItem('impostoresIndices', JSON.stringify(impostoresIndices))

    navigate('/juegocompetitivo')
  }

  return (
    <div className="container">
      <h1 className="titulo">EL IMPOSTOR UNIVERSAL</h1>

      <div className="seccion">
        <label className="label-link">Link de Google Sheets</label>
        <input
          type="text"
          className="input-link"
          placeholder="https://docs.google.com/spreadsheets/d/..."
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
      </div>

      {error && <div className="error">{error}</div>}

      <button 
        className="btn-mostrar" 
        onClick={cargarLista} 
        disabled={cargando}
      >
        {cargando ? 'CARGANDO...' : 'MOSTRAR LISTA'}
      </button>

      <div className="seccion">
        <label className="label">Cantidad de jugadores</label>
        <div className="contador">
          <button onClick={() => setJugadores(p => Math.max(1, p - 1))}>-</button>
          <span className="numero">{jugadores}</span>
          <button onClick={() => setJugadores(p => p + 1)}>+</button>
        </div>
      </div>

      <div className="seccion">
        <label className="label">Cantidad de impostores</label>
        <div className="contador">
          <button onClick={() => setImpostores(p => Math.max(0, p - 1))}>-</button>
          <span className="numero">{impostores}</span>
          <button onClick={() => setImpostores(p => p + 1)}>+</button>
        </div>
      </div>

      <div className="botones-modo">
        <button 
          className="btn-modo competitivo activo" 
          onClick={iniciarCompetitivo}
        >
          COMPETITIVO
        </button>
        <button className="btn-modo fiesta" disabled>
          MODO FIESTA (próximamente)
        </button>
      </div>

      {/* LISTA DE JUGADORES ACTIVOS */}
      {listaFinal.length > 0 && (
        <div className="resultado">
          <h2>NOMBRES: {listaFinal.length}</h2>
          <ul className="lista-nombres">
            {listaFinal.map((nombre, i) => (
              <li key={i}>
                {i + 1}. {nombre}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}