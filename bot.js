import TelegramBot from "node-telegram-bot-api";
import fs from "fs";
import {
  nuevaPartida,
  obtenerPartida,
  agregarJugador,
  siguienteRonda,
  resumenPuntos
} from "./game.js";

export const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false });

// Persistencia simple
let data = { victorias: {} };

try {
  data = JSON.parse(fs.readFileSync("./data.json"));
} catch (e) {
  console.log("Creando data.json nuevo");
}

function save() {
  fs.writeFileSync("./data.json", JSON.stringify(data, null, 2));
}

// Comando /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Bienvenido al bot de juego.\n\nComandos:\n" +
      "/nueva_partida - Crear partida\n" +
      "/unirme - Unirte a la partida\n" +
      "/ronda - Avanzar de ronda\n" +
      "/puntos - Ver marcador"
  );
});

// /nueva_partida
bot.onText(/\/nueva_partida/, (msg) => {
  const chatId = msg.chat.id;
  nuevaPartida(chatId);
  bot.sendMessage(
    chatId,
    "Nueva partida creada.\n" +
      "Usen /unirme para entrar.\n" +
      "Cuando estén listos, el admin puede usar /ronda para comenzar."
  );
});

// /unirme
bot.onText(/\/unirme/, (msg) => {
  const chatId = msg.chat.id;
  const partida = obtenerPartida(chatId);
  if (!partida) {
    bot.sendMessage(chatId, "No hay partida activa. Usa /nueva_partida primero.");
    return;
  }

  agregarJugador(chatId, msg.from);
  bot.sendMessage(chatId, `${msg.from.first_name} se ha unido a la partida.`);
});

// /ronda
bot.onText(/\/ronda/, (msg) => {
  const chatId = msg.chat.id;
  const partida = obtenerPartida(chatId);
  if (!partida) {
    bot.sendMessage(chatId, "No hay partida activa.");
    return;
  }

  if (partida.estado === "finalizada") {
    bot.sendMessage(chatId, "La partida ya terminó.\n" + resumenPuntos(chatId));
    return;
  }

  if (partida.estado === "esperando_jugadores") {
    partida.estado = "en_ronda";
  } else {
    siguienteRonda(chatId);
  }

  if (partida.estado === "finalizada") {
    bot.sendMessage(chatId, "La partida ha terminado.\n" + resumenPuntos(chatId));
  } else {
    bot.sendMessage(
      chatId,
      `Comienza la ronda ${partida.ronda}.\n` +
        "Aquí iría tu lógica de juego (preguntas, votaciones, etc.)."
    );
  }
});

// /puntos
bot.onText(/\/puntos/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, resumenPuntos(chatId));
});

// Mensajes genéricos
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  if (msg.text && !msg.text.startsWith("/")) {
    // Aquí puedes enganchar lógica de respuestas, votos, etc.
    console.log("Mensaje recibido:", msg.text);
  }
});
