// Estado en memoria
const partidas = {}; // chatId -> partida

function nuevaPartida(chatId) {
  partidas[chatId] = {
    ronda: 1,
    maxRondas: 5,
    jugadores: {}, // userId -> { nombre, puntos }
    estado: "esperando_jugadores" // o "en_ronda", "votando", "finalizada"
  };
}

function obtenerPartida(chatId) {
  return partidas[chatId] || null;
}

function agregarJugador(chatId, user) {
  const partida = obtenerPartida(chatId);
  if (!partida) return;

  if (!partida.jugadores[user.id]) {
    partida.jugadores[user.id] = {
      nombre: user.first_name || `Jugador ${user.id}`,
      puntos: 0
    };
  }
}

function siguienteRonda(chatId) {
  const partida = obtenerPartida(chatId);
  if (!partida) return;

  partida.ronda += 1;
  if (partida.ronda > partida.maxRondas) {
    partida.estado = "finalizada";
  } else {
    partida.estado = "en_ronda";
  }
}

function resumenPuntos(chatId) {
  const partida = obtenerPartida(chatId);
  if (!partida) return "No hay partida.";

  const jugadores = Object.values(partida.jugadores);
  if (jugadores.length === 0) return "No hay jugadores.";

  const lineas = jugadores
    .sort((a, b) => b.puntos - a.puntos)
    .map(j => `${j.nombre}: ${j.puntos} puntos`);

  return `Marcador actual:\n\n${lineas.join("\n")}`;
}

export {
  nuevaPartida,
  obtenerPartida,
  agregarJugador,
  siguienteRonda,
  resumenPuntos
};
