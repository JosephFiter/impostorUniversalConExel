import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css'; // Reutilizamos los estilos

function Juegocompetitivo() {
  const navigate = useNavigate();
  const [jugadores, setJugadores] = useState([]);
  const [impostoresCount, setImpostoresCount] = useState(2);
  const [mostrarRol, setMostrarRol] = useState(false);
  const [jugadorActual, setJugadorActual] = useState('');
  const [esImpostor, setEsImpostor] = useState(false);
  const [objetivo, setObjetivo] = useState('');
  const [indiceActual, setIndiceActual] = useState(0);

  useEffect(() => {
    const lista = JSON.parse(localStorage.getItem('listaActiva') || '[]');
    const impostores = parseInt(localStorage.getItem('impostoresTotales') || '2');

    if (lista.length === 0) {
      navigate('/');
      return;
    }

    setJugadores(lista);
    setImpostoresCount(impostores);

    // Barajar y elegir impostores
    const barajado = [...lista].sort(() => Math.random() - 0.5);
    const impostores = barajado.slice(0, impostores);
    const objetivoAleatorio = barajado[impostores.length + Math.floor(Math.random() * (barajado.length - impostores.length))];

    // Guardar en localStorage para que todos vean su rol correcto
    localStorage.setItem('impostoresLista', JSON.stringify(impostores));
    localStorage.setItem('objetivoGlobal', objetivoAleatorio);

    pasarSiguienteJugador();
  }, []);

  const pasarSiguienteJugador = () => {
    if (indiceActual >= jugadores.length) {
      // Todos vieron su rol
      return;
    }

    const jugador = jugadores[indiceActual];
    const impostoresLista = JSON.parse(localStorage.getItem('impostoresLista') || '[]');
    const esImp = impostoresLista.includes(jugador);
    const objetivoGlobal = localStorage.getItem('objetivoGlobal');

    setJugadorActual(jugador);
    setEsImpostor(esImp);
    setObjetivo(objetivoGlobal);
    setMostrarRol(false);
    setIndiceActual(prev => prev + 1);
  };

  if (jugadores.length === 0) return null;

  return (
    <div className="container juego-screen">
      <h1 className="titulo gran">TU TURNO</h1>

      {!mostrarRol ? (
        <div className="centro">
          <p className="instruccion">Toca el botón cuando estés listo</p>
          <button className="btn-grande" onClick={() => setMostrarRol(true)}>
            MOSTRAR ROL
          </button>
        </div>
      ) : (
        <div className="rol-revelado">
          <h2 className={esImpostor ? "impostor" : "tripulante"}>
            {esImpostor ? "¡ERES EL IMPOSTOR!" : `Tu objetivo: matar a ${objetivo}`}
          </h2>
          <p className="nombre-jugador">{jugadorActual}</p>

          {indiceActual < jugadores.length ? (
            <button className="btn-siguiente" onClick={pasarSiguienteJugador}>
              SIGUIENTE →
            </button>
          ) : (
            <button className="btn-siguiente" onClick={() => navigate('/')}>
              VOLVER AL MENÚ
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Juegocompetitivo;