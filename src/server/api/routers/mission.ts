import { z } from "zod";
import {
  BOXWORK_MISSION_PARAMETERS,
  BOXWORK_WAYPOINT_NODES,
  FUENTES_NASA,
} from "~/data/boxwork_mission";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import type {
  DetourEvaluationResult,
  MissionMode,
  MissionSimulationResult,
} from "~/types/mission";

/**
 * Calcula las variables de supervivencia para una configuración dada.
 * El astronauta camina todo el recorrido a la misma velocidad y con la misma
 * tasa de consumo de O2 (0.076 kg/h según referencia NASA BVAD) en ambos modos.
 */
function calcularMetricasSupervivencia(opts: {
  mode: MissionMode;
  includeDetour: boolean;
  simulateSolarAlert: boolean;
}) {
  const params = BOXWORK_MISSION_PARAMETERS;
  const nodo3 = BOXWORK_WAYPOINT_NODES.find(
    (n) => n.id === "nodo-3-ciencia-boxwork"
  )!;
  const nodo4 = BOXWORK_WAYPOINT_NODES.find(
    (n) => n.id === "nodo-4-desvio-nodulos"
  )!;

  // Desplazamiento de ida y regreso (misma velocidad de caminata en ambos escenarios)
  const desvioCaminataMitad = opts.includeDetour
    ? params.tiempoAdicionalDesvioIdaRegresoMin / 2
    : 0;

  const idaMin = params.tiempoTramoIdaBaseMin + desvioCaminataMitad;
  const regresoMin = params.tiempoTramoRegresoBaseMin + desvioCaminataMitad;

  // Duración de paradas científicas según el modo ("solo" vs "conRover")
  const duracionParada1Min =
    opts.mode === "conRover"
      ? nodo3.duracionParadaMin.conRover
      : nodo3.duracionParadaMin.solo;

  const duracionParada2Min = opts.includeDetour
    ? opts.mode === "conRover"
      ? nodo4.duracionParadaMin.conRover
      : nodo4.duracionParadaMin.solo
    : 0;

  const paradasCientificasMin = duracionParada1Min + duracionParada2Min;

  // Penalización opcional por protocolo de refugio/alerta solar
  const penalizacionSolarMin = opts.simulateSolarAlert
    ? params.penalizacionAlertaSolarMin
    : 0;

  const tiempoTotalEvaMin =
    idaMin + paradasCientificasMin + regresoMin + penalizacionSolarMin;

  // Oxígeno utilizado = (tiempoTotalEvaMin / 60) * 0.076
  const oxigenoUsadoKg = Number(
    ((tiempoTotalEvaMin / 60) * params.tasaOxigenoKgHora).toFixed(4)
  );
  const oxigenoRestanteKg = Number(
    Math.max(0, params.capacidadInicialO2Kg - oxigenoUsadoKg).toFixed(4)
  );
  const oxigenoRestantePorcentaje = Number(
    ((oxigenoRestanteKg / params.capacidadInicialO2Kg) * 100).toFixed(1)
  );
  const perforaReserva25 =
    oxigenoRestantePorcentaje < params.reservaMinimaO2Porcentaje;

  // Energía del Rover (%)
  const energiaRoverUsadaPorcentaje =
    opts.mode === "conRover"
      ? params.consumoRoverRutaBasePorcentaje +
      params.consumoRoverParadaCientifica1Porcentaje +
      (opts.includeDetour ? params.consumoRoverDesvioAdicionalPorcentaje : 0) +
      (opts.simulateSolarAlert ? 6 : 0)
      : 0;

  const energiaRoverRestantePorcentaje =
    opts.mode === "conRover"
      ? Math.max(
        0,
        params.energiaInicialRoverPorcentaje - energiaRoverUsadaPorcentaje
      )
      : params.energiaInicialRoverPorcentaje;

  const bajoReservaRover =
    opts.mode === "conRover" &&
    energiaRoverRestantePorcentaje < params.reservaMinimaRoverPorcentaje;

  return {
    idaMin,
    paradasCientificasMin,
    regresoMin,
    penalizacionSolarMin,
    tiempoTotalEvaMin,
    oxigenoUsadoKg,
    oxigenoRestanteKg,
    oxigenoRestantePorcentaje,
    perforaReserva25,
    energiaRoverUsadaPorcentaje,
    energiaRoverRestantePorcentaje,
    bajoReservaRover,
  };
}

/**
 * Regla de 4 pasos para evaluar desvíos (Fase 3 de la Guía de Supervivencia):
 * 1. Comprobar viabilidad de reserva (O2 >= 25% y batería rover >= reserva).
 * 2. Excluir riesgos inaceptables (pendiente > 22° como Nodo 2).
 * 3. Comparar ciencia vs. costo entre la ruta base y la ruta con desvío (Nodo 4).
 * 4. Explicar la recomendación de forma transparente en el modo seleccionado.
 */
function evaluarDesvioCuatroPasos(opts: {
  mode: MissionMode;
  simulateSolarAlert: boolean;
}): DetourEvaluationResult {
  const params = BOXWORK_MISSION_PARAMETERS;
  const sinDesvio = calcularMetricasSupervivencia({
    mode: opts.mode,
    includeDetour: false,
    simulateSolarAlert: opts.simulateSolarAlert,
  });
  const conDesvio = calcularMetricasSupervivencia({
    mode: opts.mode,
    includeDetour: true,
    simulateSolarAlert: opts.simulateSolarAlert,
  });

  const nodosRiesgoAlto = BOXWORK_WAYPOINT_NODES.filter(
    (n) => n.riesgoTramo.nivel === "alto" || n.riesgoTramo.pendienteGrados > 22
  );
  const nodo4 = BOXWORK_WAYPOINT_NODES.find(
    (n) => n.id === "nodo-4-desvio-nodulos"
  )!;

  // Paso 1: Viabilidad de reserva con el desvío incluido
  const cumpleO2ConDesvio = !conDesvio.perforaReserva25;
  const cumpleRoverConDesvio = !conDesvio.bajoReservaRover;
  const paso1Aprobado = cumpleO2ConDesvio && cumpleRoverConDesvio;

  // Paso 2: Exclusión de riesgo alto (>22°)
  // El Nodo 2 (24.5°) queda excluido como obstáculo; el desvío a Nodo 4 tiene 11.8° (<22°).
  const paso2Aprobado =
    nodo4.riesgoTramo.pendienteGrados <= 22 &&
    nodo4.riesgoTramo.nivel !== "alto";

  // Paso 3: Comparación Ciencia vs Costo
  const tiempoAdicionalMin =
    conDesvio.tiempoTotalEvaMin - sinDesvio.tiempoTotalEvaMin;
  const oxigenoAdicionalKg = Number(
    (conDesvio.oxigenoUsadoKg - sinDesvio.oxigenoUsadoKg).toFixed(4)
  );
  const energiaRoverAdicionalPorcentaje =
    conDesvio.energiaRoverUsadaPorcentaje -
    sinDesvio.energiaRoverUsadaPorcentaje;

  // Paso 4: Dictamen transparente
  const recomendado = paso1Aprobado && paso2Aprobado;
  const etiquetaModo =
    opts.mode === "conRover"
      ? "Astronauta acompañado por Rover"
      : "Astronauta Solo";

  const resumenEjecutivo = recomendado
    ? `DESVÍO VIABLE EN MODO "${etiquetaModo.toUpperCase()}": Se obtiene el muestreo MAHLI de nódulos evaporíticos (PIA26697) regresando con ${conDesvio.oxigenoRestantePorcentaje}% de O2 (>= ${params.reservaMinimaO2Porcentaje}% de reserva).`
    : `DESVÍO RECHAZADO EN MODO "${etiquetaModo.toUpperCase()}": Añadir la Parada Científica 2 (Nodo 4) deja el O2 al regreso en ${conDesvio.oxigenoRestantePorcentaje}%, perforando la reserva obligatoria del ${params.reservaMinimaO2Porcentaje}%.`;

  const justificacionCompleta = recomendado
    ? `En modo ${etiquetaModo}, el rover pre-escanea el afloramiento de nódulos (Nodo 4) y reduce la parada científica de 40 min a 15 min. El tiempo adicional total es de +${tiempoAdicionalMin} min (+${oxigenoAdicionalKg} kg O2 y -${energiaRoverAdicionalPorcentaje}% de batería del rover), conservando ${conDesvio.oxigenoRestantePorcentaje}% de O2 y ${conDesvio.energiaRoverRestantePorcentaje}% de energía del rover al regresar al Nodo 1, mientras se bordea el Nodo 2 excluido por pendiente de 24.5° (>22°).`
    : `Aunque el desvío al Nodo 4 evita la zona de exclusión del Nodo 2 (24.5° > 22°) y aporta valor científico de alta prioridad (nódulos evaporíticos PIA26697), en modo ${etiquetaModo} la parada requiere 40 min más 25 min de marcha adicional (+${tiempoAdicionalMin} min en total, +${oxigenoAdicionalKg} kg O2). Esto eleva el tiempo total de EVA a ${conDesvio.tiempoTotalEvaMin} min y reduce el O2 remanente a ${conDesvio.oxigenoRestantePorcentaje}% (< ${params.reservaMinimaO2Porcentaje}%). La seguridad actúa como filtro previo y no se compensa con interés científico.`;

  return {
    paso1ViabilidadReserva: {
      aprobado: paso1Aprobado,
      oxigenoProyectadoConDesvioPorcentaje:
        conDesvio.oxigenoRestantePorcentaje,
      energiaRoverProyectadaConDesvioPorcentaje:
        conDesvio.energiaRoverRestantePorcentaje,
      detalle: paso1Aprobado
        ? `Reserva conservada: retorno proyectado con ${conDesvio.oxigenoRestantePorcentaje}% de O2 (umbral mínimo ${params.reservaMinimaO2Porcentaje}%).`
        : `Fallo de reserva: el retorno cae a ${conDesvio.oxigenoRestantePorcentaje}% de O2, por debajo del ${params.reservaMinimaO2Porcentaje}% mínimo requerido.`,
    },
    paso2ExclusionRiesgoAlto: {
      aprobado: paso2Aprobado,
      nodosExcluidosPorPendiente: nodosRiesgoAlto.map(
        (n) => `${n.nombre} (${n.riesgoTramo.pendienteGrados}°)`
      ),
      detalle: `El Nodo 2 (PIA26364, pendiente 24.5° > 22°) queda bloqueado permanentemente como obstáculo de riesgo alto. El corredor hacia el Nodo 4 presenta pendiente moderada (${nodo4.riesgoTramo.pendienteGrados}° <= 22°).`,
    },
    paso3ComparacionCienciaCosto: {
      beneficioCientifico:
        "Muestreo MAHLI/APXS de nódulos evaporíticos diagenéticos (PIA26697, Sol 4636) para contrastar salmueras tardías frente a las venas de sulfato del Nodo 3 (PIA26558).",
      tiempoAdicionalMin,
      oxigenoAdicionalKg,
      energiaRoverAdicionalPorcentaje,
      detalle: `Costo adicional del desvío en modo ${etiquetaModo}: +${tiempoAdicionalMin} min de EVA, +${oxigenoAdicionalKg} kg de O2 y ${opts.mode === "conRover"
          ? `-${energiaRoverAdicionalPorcentaje}% de batería del rover`
          : "0% de batería del rover (rover en base)"
        }.`,
    },
    paso4ExplicacionTransparente: {
      recomendado,
      resumenEjecutivo,
      justificacionCompleta,
    },
  };
}

export const missionRouter = createTRPCRouter({
  /**
   * 1. getMissionData: devuelve los nodos, las capas y los parámetros base.
   */
  getMissionData: publicProcedure.query(() => {
    return {
      ubicacion: "Mount Sharp (Aeolis Mons) — Sector Boxwork, Cráter Gale",
      parametros: BOXWORK_MISSION_PARAMETERS,
      nodos: BOXWORK_WAYPOINT_NODES,
      fuentesOficiales: FUENTES_NASA,
    };
  }),

  /**
   * 2. simulateMission: recibe { mode, includeDetour, simulateSolarAlert } y calcula
   * tiempoTotalEvaMin, oxigenoUsadoKg, oxigenoRestantePorcentaje, perforación de reserva 25%,
   * energiaRoverRestantePorcentaje y evaluacionDesvio (regla de 4 pasos).
   */
  simulateMission: publicProcedure
    .input(
      z.object({
        mode: z.enum(["solo", "conRover"]),
        includeDetour: z.boolean(),
        simulateSolarAlert: z.boolean().default(false),
      })
    )
    .query(({ input }): MissionSimulationResult => {
      const metricas = calcularMetricasSupervivencia(input);
      const evaluacionDesvio = evaluarDesvioCuatroPasos({
        mode: input.mode,
        simulateSolarAlert: input.simulateSolarAlert,
      });

      const alertasSecundarias: string[] = [
        "Nodo 2 (PIA26364, Sol 4189) excluido automáticamente de la ruta por pendiente severa >22° (24.5°, rocas angulares).",
      ];

      if (input.includeDetour) {
        alertasSecundarias.push(
          "Nodo 4 (PIA26697) activo: extensión simulada sobre cartografía real (esRutaHistoricaCuriosity: false)."
        );
      }

      if (input.simulateSolarAlert) {
        alertasSecundarias.push(
          `Alerta de contingencia solar activa: +${BOXWORK_MISSION_PARAMETERS.penalizacionAlertaSolarMin} min por protocolo de resguardo.`
        );
      }

      let mensajeAlertaPrincipal: string | null = null;
      let nivelAlerta: "nominal" | "precaucion" | "critica" = "nominal";

      if (metricas.perforaReserva25) {
        nivelAlerta = "critica";
        mensajeAlertaPrincipal = `ALERTA ROJA DE SUPERVIVENCIA: El O2 restante al regreso (${metricas.oxigenoRestantePorcentaje}%) perfora la reserva mínima obligatoria del ${BOXWORK_MISSION_PARAMETERS.reservaMinimaO2Porcentaje}%.`;
      } else if (metricas.bajoReservaRover) {
        nivelAlerta = "critica";
        mensajeAlertaPrincipal = `ALERTA DE ENERGÍA ROVER: Batería restante (${metricas.energiaRoverRestantePorcentaje}%) por debajo del margen de seguridad (${BOXWORK_MISSION_PARAMETERS.reservaMinimaRoverPorcentaje}%).`;
      } else if (metricas.oxigenoRestantePorcentaje < 32 || input.includeDetour) {
        nivelAlerta = "precaucion";
      }

      const esExitosa = !metricas.perforaReserva25 && !metricas.bajoReservaRover;

      return {
        mode: input.mode,
        includeDetour: input.includeDetour,
        simulateSolarAlert: input.simulateSolarAlert,
        desgloseTiempoMin: {
          idaMin: metricas.idaMin,
          paradasCientificasMin: metricas.paradasCientificasMin,
          regresoMin: metricas.regresoMin,
          penalizacionSolarMin: metricas.penalizacionSolarMin,
          tiempoTotalEvaMin: metricas.tiempoTotalEvaMin,
        },
        oxigeno: {
          capacidadInicialKg: BOXWORK_MISSION_PARAMETERS.capacidadInicialO2Kg,
          oxigenoUsadoKg: metricas.oxigenoUsadoKg,
          oxigenoRestanteKg: metricas.oxigenoRestanteKg,
          oxigenoRestantePorcentaje: metricas.oxigenoRestantePorcentaje,
          reservaMinimaPorcentaje:
            BOXWORK_MISSION_PARAMETERS.reservaMinimaO2Porcentaje,
          perforaReserva25: metricas.perforaReserva25,
        },
        rover: {
          acompanando: input.mode === "conRover",
          energiaInicialPorcentaje:
            BOXWORK_MISSION_PARAMETERS.energiaInicialRoverPorcentaje,
          energiaRoverUsadaPorcentaje: metricas.energiaRoverUsadaPorcentaje,
          energiaRoverRestantePorcentaje:
            metricas.energiaRoverRestantePorcentaje,
          reservaMinimaRoverPorcentaje:
            BOXWORK_MISSION_PARAMETERS.reservaMinimaRoverPorcentaje,
          bajoReservaRover: metricas.bajoReservaRover,
          funcionExplicita:
            "Transportar herramientas/muestras y pre-escanear objetivos (reduce paradas científicas de 30->15 min en Nodo 3 y de 40->15 min en Nodo 4 sin alterar la velocidad de caminata ni la tasa de 0.076 kg O2/h).",
        },
        estadoMision: {
          esExitosa,
          nivelAlerta,
          mensajeAlertaPrincipal,
          alertasSecundarias,
        },
        evaluacionDesvio,
      };
    }),
});
