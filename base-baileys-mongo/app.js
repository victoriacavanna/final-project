const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MongoAdapter = require("@bot-whatsapp/database/mongo");
const axios = require("axios").default;
const moment = require("moment");

const MONGO_DB_URI = "mongodb://0.0.0.0:27017";
const MONGO_DB_NAME = "db_bot";

// Función auxiliar para mostrar opciones de cancelación
const mostrarOpcionesCancelacion = async (turnosExistentes) => {
  if (turnosExistentes.length === 0) {
    return "❌ No tienes turnos agendados para cancelar.";
  }

  let turnosMensaje = turnosExistentes
    .map((turno, index) => `${index + 1}. 🗓️ ${turno.date} a las ⏰ ${turno.hour}`)
    .join("\n");

  return turnosMensaje;
};

// Función para cancelar un turno específico
const cancelarTurnoEspecifico = async (idTurno) => {
  try {
    const respuesta = await axios.put(
      `http://localhost:5000/api/appointments/${idTurno}`,
      { status: "Cancelado" },
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );
    if (respuesta.status === 200) {
      console.log("Turno cancelado con éxito:", respuesta.data);
      return respuesta.data;
    } else {
      console.error("No se pudo cancelar el turno:", respuesta.data);
      return null;
    }
  } catch (error) {
    console.error("Error al cancelar el turno:", error.response?.data || error.message);
    return null;
  }
};

const flowCancelarTurno = addKeyword("###CANCELAR_TURNO###")
  .addAnswer("🔍 *Aquí están los turnos que tienes agendados:*")
  .addAction(async (ctx, { flowDynamic, state }) => {
    const turnosExistentes = await obtenerTurnos(ctx.from);

    if (!turnosExistentes || turnosExistentes.length === 0) {
      return await flowDynamic("❌ No tienes turnos agendados para cancelar.");
    }

    const mensajeOpciones = await mostrarOpcionesCancelacion(turnosExistentes);

    await state.update({ turnosExistentes });

    await flowDynamic([
      mensajeOpciones,
      "Por favor, selecciona el número del turno que deseas cancelar.",
    ]);
  })
  .addAnswer("Selecciona el número de turno:", { capture: true }, async (ctx, { state, flowDynamic, fallBack }) => {
    const turnosExistentes = state.get("turnosExistentes");
    const numeroTurnoSeleccionado = parseInt(ctx.body.trim(), 10);

    if (
      isNaN(numeroTurnoSeleccionado) ||
      numeroTurnoSeleccionado < 1 ||
      numeroTurnoSeleccionado > turnosExistentes.length
    ) {
      return fallBack("❌ Opción inválida. Por favor selecciona un número de turno válido.");
    }

    const turnoAEliminar = turnosExistentes[numeroTurnoSeleccionado - 1];

    await state.update({ turnoAEliminar });

    await flowDynamic([
      `🛑 Estás a punto de cancelar el turno para el día ${turnoAEliminar.date} a las ${turnoAEliminar.hour}.`,
      "¿Estás seguro de cancelar este turno? Responde *si* para confirmar o *no* para cancelar la operación.",
    ]);
  })
  .addAnswer("Confirma la cancelación:", { capture: true }, async (ctx, { state, flowDynamic, endFlow, fallBack }) => {
    const turnoAEliminar = state.get("turnoAEliminar");

    if (!turnoAEliminar) {
      return fallBack("🚨 No se encontró el turno a cancelar. Por favor, intenta nuevamente.");
    }

    const respuestaUsuario = ctx.body.toLowerCase();

    if (respuestaUsuario === "si") {
      const respuesta = await cancelarTurnoEspecifico(turnoAEliminar.id);

      if (respuesta) {
        await flowDynamic([
          "✅ Tu turno ha sido cancelado exitosamente.",
          `Tu turno del día ${turnoAEliminar.date} a las ${turnoAEliminar.hour} ha sido cancelado.`,
        ]);
      } else {
        await flowDynamic("🚨 No se pudo cancelar el turno. Intenta nuevamente más tarde.");
      }
      return endFlow();
    } else if (respuestaUsuario === "no") {
      await flowDynamic([
        "❌ Cancelación descartada.",
        `Tu turno para el día ${turnoAEliminar.date} a las ${turnoAEliminar.hour} sigue activo.`,
      ]);
      return endFlow();
    } else {
      return fallBack("❌ Respuesta inválida. Por favor ingresa *si* o *no*.");
    }
  });

// Función para obtener turnos
const obtenerTurnos = async (numeroCelular) => {
  try {
    const respuesta = await axios.get(`http://localhost:5000/api/appointments/phone/${numeroCelular}`);
    if (respuesta.status === 200) {
      if (Array.isArray(respuesta.data)) {
        return respuesta.data;
      } else {
        return [respuesta.data]; 
      }
    } else {
      return []; 
    }
  } catch (error) {
    console.error("Error al verificar el turno:", error);
    return []; 
  }
};






const verificarTurno = async (numeroCelular) => {
  try {
    const respuesta = await axios.get(`http://localhost:5000/api/appointments/phone/${numeroCelular}`);
    if (respuesta.status === 200) {
      if (Array.isArray(respuesta.data)) {
        return respuesta.data;
      } else {
        return [respuesta.data];
      }
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error al verificar el turno:", error);
    return [];
  }
};



const flowVerificarTurno = addKeyword("###VERIFICAR_TURNO###").addAnswer(
  "Verificando si posees un turno...",
  { delay: 3000 },
  async (ctx, { flowDynamic }) => {
    const turnos = await verificarTurno(ctx.from); // Llama a la función para verificar turnos
  
    if (Array.isArray(turnos) && turnos.length > 0) {
      let turnosMensaje = turnos.map((turno) => {
        const date = turno.date || 'Fecha no disponible';
        const hour = turno.hour || 'Hora no disponible';
        const status = turno.status || 'Estado no disponible';
  
        return `🗓️ *Fecha:* ${date}\n⏰ *Hora:* ${hour}\n✅ *Estado:* ${status}\n💬 *Tipo de consulta:* ${turno.appointmentType}\n`;
      }).join("\n");
  
      await flowDynamic(`Aquí están tus turnos agendados:\n\n${turnosMensaje}`);
    } else {
      await flowDynamic("❌ No tienes turnos agendados.");
    }
  }
);



  const flowSolicitarTurno = addKeyword("###SOLICITAR_TURNO###")
  .addAnswer("👤 *Ingresa tu nombre y apellido:*", { capture: true }, async (ctx, { flowDynamic, globalState }) => {
    await globalState.update({ nombre: ctx.body });
  })
  .addAnswer("Gracias, ahora selecciona el tipo de consulta.\nOpciones:\n1. 🦷 Limpieza\n2. 🩺 Consulta\n3. 🔄 Otro\n4. 💉 Tratamiento", { capture: true }, async (ctx, { globalState, flowDynamic, fallBack }) => {
    const tipoConsultaSeleccionado = ctx.body.trim();

    const opciones = {
      "1": "Limpieza",
      "2": "Consulta",
      "3": "Otro",
      "4": "Tratamiento"
    };

    const tipoConsulta = opciones[tipoConsultaSeleccionado];
    
    if (!tipoConsulta) {
      return fallBack("❌ Opción no válida. Por favor, selecciona un número de la lista: 1, 2, 3 o 4.");
    }

    await globalState.update({ tipoConsulta });
  })
  .addAnswer("Por favor, ingresa la fecha seleccionada (formato: DD/MM/YYYY).", { capture: true }, async (ctx, { globalState, flowDynamic, fallBack }) => {
    const fechaSeleccionada = ctx.body.trim();
    const fechaValida = moment(fechaSeleccionada, "DD/MM/YYYY", true).isValid();
    
    const fechaSeleccionadaMoment = moment(fechaSeleccionada, "DD/MM/YYYY");
    const fechaActual = moment();

    if (!fechaValida) {
      return fallBack("❌ La fecha ingresada no es válida. Por favor ingresa una fecha en formato DD/MM/YYYY.");
    }
    
    if (fechaSeleccionadaMoment.isBefore(fechaActual, 'day')) {
      return fallBack("❌ La fecha ingresada no puede ser anterior a la fecha actual. Por favor ingresa una fecha futura.");
    }

    const turnosExistentes = await verificarTurno(ctx.from);

    const turnosEnFecha = turnosExistentes.filter(turno => {
      const turnoFecha = moment(turno.date, "DD/MM/YYYY");
      return turnoFecha.isSame(fechaSeleccionadaMoment, 'day');
    });

    if (turnosEnFecha.length > 0) {
      return fallBack(`❌ Ya tienes un turno programado para el día ${fechaSeleccionada}.`);
    }

    await globalState.update({ fecha: fechaSeleccionada });
    await mostrarHorariosDisponibles(ctx, globalState, flowDynamic); 
  })
  .addAnswer("Ingresa el horario seleccionado HH:MM", { capture: true }, async (ctx, { globalState, flowDynamic, fallBack }) => {
    const horarioSeleccionado = ctx.body.trim();
    const partesHorario = horarioSeleccionado.split(":");
    if (partesHorario.length !== 2) {
      return fallBack("❌ El formato del horario ingresado no es válido. Debe ser HH:MM.");
    }
    const horas = parseInt(partesHorario[0], 10);
    const minutos = parseInt(partesHorario[1], 10);
    if (isNaN(horas) || horas < 9 || horas > 17 || isNaN(minutos) || minutos % 30 !== 0 || minutos < 0 || minutos > 59) {
      return fallBack("❌ El horario ingresado no es válido. Debe estar entre las 09:00 y las 17:30 con intervalos de 30 minutos.");
    }

    const turnosOcupados = globalState.getMyState().turnosOcupados || [];
    if (turnosOcupados.includes(horarioSeleccionado)) {
      await flowDynamic("❌ El horario seleccionado no está disponible, por favor elige otro.");
      return await mostrarHorariosDisponibles(ctx, globalState, flowDynamic);
    }

    await globalState.update({ horario: horarioSeleccionado });
    await flowDynamic([
      `Tu turno es para el día *${globalState.getMyState().fecha}* a las *${globalState.getMyState().horario}*`,
      "Por favor, ingresa *Si* para confirmar el turno o *No* para cancelarlo.",
    ]);
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, globalState, fallBack, endFlow }) => {
    if (ctx.body.toLowerCase() === "si") {
      try {
        const turno = {
          name: globalState.getMyState().nombre,
          phone: ctx.from,
          date: globalState.getMyState().fecha,
          hour: globalState.getMyState().horario,
          appointmentType: globalState.getMyState().tipoConsulta,
        };

        await axios.post("http://localhost:5000/api/appointments", turno, { withCredentials: true });

        const turnosOcupados = globalState.getMyState().turnosOcupados || [];
        turnosOcupados.push(turno.hour);
        await globalState.update({ turnosOcupados });

        await flowDynamic([
          "🎉 ¡Tu turno ha sido confirmado!",
          `🗓️ Te esperamos el día ${globalState.getMyState().fecha} a las ${globalState.getMyState().horario}.`,
          `💬 Tipo de consulta: ${globalState.getMyState().tipoConsulta}`,
        ]);
      } catch (error) {
        console.error("Error al confirmar el turno:", error);
        await flowDynamic("🚨 Hubo un problema al confirmar tu turno. Inténtalo de nuevo más tarde.");
      }
    } else if (ctx.body.toLowerCase() === "no") {
      return endFlow("❌ El turno ha sido cancelado.");
    } else {
      return fallBack("❌ Opción incorrecta. Por favor ingresa *si* o *no*.");
    }
  });



// Función para mostrar los horarios disponibles
const mostrarHorariosDisponibles = async (ctx, globalState, flowDynamic) => {
  const horariosDisponibles = [];
  for (let h = 9; h <= 17; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (!(h === 17 && m > 30)) {
        horariosDisponibles.push(`${h}:${m < 10 ? '0' + m : m}`);
      }
    }
  }

  const turnosOcupados = globalState.getMyState().turnosOcupados || [];
  const horariosLibres = horariosDisponibles.filter(horario => !turnosOcupados.includes(horario));

  if (horariosLibres.length === 0) {
    await flowDynamic("Lo siento, no hay horarios disponibles para el día seleccionado.");
    return;
  }

  let horariosTexto = '';
  for (let i = 0; i < horariosLibres.length; i++) {
    horariosTexto += `- ${horariosLibres[i]}  `;
    if ((i + 1) % 5 === 0) {
      horariosTexto += "\n";
    }
  }

  await flowDynamic(`🕐 Horarios disponibles para el día ${globalState.getMyState().fecha}:\n${horariosTexto}`);
};


// Flow inicial de bienvenida
const flowDefault = addKeyword(EVENTS.WELCOME).addAnswer(
  [
    "Bienvenido a la Clínica Odontológica 🦷 te detallo a continuación las opciones!",
    "1-Solicitar turno 📅",
    "2-Verificar turno ✔",
    "3-Cancelar Turno ❌",
  ],
  { capture: true },
  async (ctx, { fallBack, gotoFlow, globalState }) => {
    const nombre = ctx.pushName;
    await globalState.update({ nombre: nombre });

    if (!["1", "2", "3"].includes(ctx.body)) {
      return fallBack("Ingresaste una opción incorrecta, intenta nuevamente.");
    }
    if (ctx.body === "1") {
      return gotoFlow(flowSolicitarTurno);
    }
    if (ctx.body === "2") {
      return gotoFlow(flowVerificarTurno);
    }
    if (ctx.body === "3") {
      return gotoFlow(flowCancelarTurno);
    }
  }
);

// Función principal
const main = async () => {
  const adapterDB = new MongoAdapter({
    dbUri: MONGO_DB_URI,
    dbName: MONGO_DB_NAME,
  });
  const adapterFlow = createFlow([flowDefault, flowSolicitarTurno, flowVerificarTurno, flowCancelarTurno]);
  const adapterProvider = createProvider(BaileysProvider);
  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
    globalState: {
      nombre: "",
      fecha: "",
      horario: "",
      phone: "",
      tipoConsulta: "",
      turnosOcupados: [],
    },
  });
  QRPortalWeb();
};

main();
