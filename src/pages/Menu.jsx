import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'

export default function Menu() {
  const navigate = useNavigate()
  const [link, setLink] = useState('')
  const [jugadores, setJugadores] = useState(10)
  const [impostores, setImpostores] = useState(2)
  const [listaFinal, setListaFinal] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  // Cargar link y lista guardada
  useEffect(() => {
    const savedLink = localStorage.getItem('impostorLink')
    const savedLista = localStorage.getItem('listaActiva')
    if (savedLink) setLink(savedLink)
    if (savedLista) setListaFinal(JSON.parse(savedLista))
  }, [])

  useEffect(() => {
    if (link) localStorage.setItem('impostorLink', link)
  }, [link])

  const cargarLista = async () => {
    if (!link) return setError('Pega un link primero')

    setCargando(true)
    setError('')
    try {
      const id = link.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1]
      if (!id) throw new Error('Link inválido')

      const csvUrl = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=Hoja 1`
      const res = await fetch(csvUrl)
      const text = await res.text()
      const lineas = text.trim().split('\n').slice(1)
      const activos = []

      for (const linea of lineas) {
        const cols = linea.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
        if (cols.length < 2) continue
        let nombre = cols[0].replace(/^"|"$/g, '').trim()
        let estado = cols[1].replace(/^"|"$/g, '').trim().toUpperCase()
        if (nombre.toUpperCase() === 'FINAL') break
        if (['VERDADERO', 'TRUE', '1', 'SI'].includes(estado)) {
          activos.push(nombre)
        }
      }

      setListaFinal(activos)
      localStorage.setItem('listaActiva', JSON.stringify(activos))
    } catch (err) {
      setError('Error al cargar la lista')
    } finally {
      setCargando(false)
    }
  }

  const iniciarCompetitivo = () => {
  if (listaFinal.length === 0) {
    setError('Primero cargá la lista con MOSTRAR LISTA')
    return
  }
  if (impostores >= jugadores) {
    setError('Impostores no pueden ser mayor o igual que jugadores')
    return
  }

  // Elegimos UN SOLO objetivo de toda la lista del Sheets
  const objetivoAleatorio = listaFinal[Math.floor(Math.random() * listaFinal.length)]

  // Guardamos todo lo necesario
  localStorage.setItem('jugadoresTotales', jugadores)           // 4
  localStorage.setItem('impostoresTotales', impostores)         // 1
  localStorage.setItem('objetivoGlobal', objetivoAleatorio)     // "pepe"
  
  // Generamos quiénes son impostores (índices 0 a jugadores-1)
  const indices = Array.from({ length: jugadores }, (_, i) => i)
  const barajado = indices.sort(() => Math.random() - 0.5)
  const impostoresIndices = barajado.slice(0, impostores)
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

      <button className="btn-mostrar" onClick={cargarLista} disabled={cargando}>
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
        <button className="btn-modo competitivo activo" onClick={iniciarCompetitivo}>
          COMPETITIVO
        </button>
        <button className="btn-modo fiesta" disabled>
          MODO FIESTA (próximamente)
        </button>
      </div>

      {listaFinal.length > 0 && (
        <div className="resultado">
          <h2>Jugadores activos: {listaFinal.length}</h2>
        </div>
      )}
    </div>
  )
}