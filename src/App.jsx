import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [link, setLink] = useState('');
  const [jugadores, setJugadores] = useState(10);
  const [impostores, setImpostores] = useState(2);
  const [modo, setModo] = useState(null);
  const [listaFinal, setListaFinal] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // Cargar link guardado al iniciar
  useEffect(() => {
    const linkGuardado = localStorage.getItem('impostorLink');
    if (linkGuardado) {
      setLink(linkGuardado);
    }
  }, []);

  // Guardar link cada vez que cambie
  useEffect(() => {
    if (link.trim()) {
      localStorage.setItem('impostorLink', link);
    }
  }, [link]);

  const cambiarJugadores = (delta) => {
    setJugadores(prev => Math.max(1, prev + delta));
  };

  const cambiarImpostores = (delta) => {
    setImpostores(prev => Math.max(0, prev + delta));
  };

  const obtenerUrlCSV = (url) => {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) return null;
    const id = match[1];
    return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=Hoja 1`;
  };

  const cargarLista = async () => {
    if (!link.trim()) {
      setError('Primero pega un link de Google Sheets');
      return;
    }

    setCargando(true);
    setError('');
    setListaFinal([]);

    try {
      const csvUrl = obtenerUrlCSV(link);
      if (!csvUrl) throw new Error('Link inválido de Google Sheets');

      const response = await fetch(csvUrl);
      if (!response.ok) throw new Error('No se pudo acceder a la hoja');

      const text = await response.text();
      const lineas = text.trim().split('\n');
      const datos = lineas.slice(1); // saltar encabezados

      const jugadoresActivos = [];

      for (const linea of datos) {
        const columnas = linea.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
        if (!columnas || columnas.length < 2) continue;

        let nombre = columnas[0].replace(/^"|"$/g, '').trim();
        let estado = columnas[1].replace(/^"|"$/g, '').trim().toUpperCase();

        if (nombre.toUpperCase() === 'FINAL') break;

        if (estado === 'VERDADERO' || estado === 'TRUE' || estado === '1' || estado === 'SI') {
          jugadoresActivos.push(nombre);
        }
      }

      setListaFinal(jugadoresActivos);

      // DEBUG EN CONSOLA
      console.clear();
      console.log('LISTA CARGADA DESDE GOOGLE SHEETS');
      console.log('Link:', link);
      console.log('Modo actual:', modo ? modo.toUpperCase() : 'Ninguno seleccionado');
      console.log('Jugadores activos (VERDADERO):');
      jugadoresActivos.forEach((j, i) => console.log(`${i + 1}. ${j}`));
      console.log(`Total: ${jugadoresActivos.length} jugadores`);

    } catch (err) {
      setError('Error: ' + err.message);
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

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

      <div className="seccion">
        <label className="label">Cantidad de jugadores</label>
        <div className="contador">
          <button onClick={() => cambiarJugadores(-1)}>-</button>
          <span className="numero">{jugadores}</span>
          <button onClick={() => cambiarJugadores(1)}>+</button>
        </div>
      </div>

      <div className="seccion">
        <label className="label">Cantidad de impostores</label>
        <div className="contador">
          <button onClick={() => cambiarImpostores(-1)}>-</button>
          <span className="numero">{impostores}</span>
          <button onClick={() => cambiarImpostores(1)}>+</button>
        </div>
      </div>

      {/* Botón para cargar y mostrar la lista */}
      <button className="btn-mostrar" onClick={cargarLista} disabled={cargando}>
        {cargando ? 'CARGANDO LISTA...' : 'MOSTRAR LISTA'}
      </button>

      {/* Botones de modo */}
      <div className="botones-modo">
        <button
          className={`btn-modo ${modo === 'competitivo' ? 'activo competitivo' : ''}`}
          onClick={() => setModo('competitivo')}
        >
          COMPETITIVO
        </button>
        <button
          className={`btn-modo ${modo === 'fiesta' ? 'activo fiesta' : ''}`}
          onClick={() => setModo('fiesta')}
        >
          MODO FIESTA
        </button>
      </div>

      {/* Resultado de la lista */}
      {listaFinal.length > 0 && (
        <div className="resultado">
          <h2>
            Jugadores activos: {listaFinal.length}
            {modo && ` · ${modo.toUpperCase()}`}
          </h2>
          <ul className="lista-jugadores">
            {listaFinal.map((jugador, i) => (
              <li key={i}>{i + 1}. {jugador}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;