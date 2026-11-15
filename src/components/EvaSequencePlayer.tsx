"use client";

import React from "react";
import type {
  MissionMode,
  MissionSimulationParameters,
  MissionSimulationResult,
} from "~/types/mission";

export interface EstadoEtapaEva {
  etapa: number;
  titulo: string;
  subtitulo: string;
  nodoFocoId: string;
  oxigenoRestanteKg: number;
  oxigenoRestantePct: number;
  tiempoAcumuladoMin: number;
  bateriaRoverPct: number;
  posicionMapa: {
    xPercent: number;
    yPercent: number;
    enTransito: boolean;
    etiqueta: string;
  };
}

export function calcularEstadoEtapaEva(opts: {
  etapa: number;
  mode: MissionMode;
  includeDetour: boolean;
  simulateSolarAlert: boolean;
  parametros: MissionSimulationParameters;
  simulation: MissionSimulationResult;
}): EstadoEtapaEva {
  const { etapa, mode, includeDetour, simulateSolarAlert, parametros, simulation } =
    opts;
  const capO2 = parametros.capacidadInicialO2Kg; // 0.380 kg
  const tasaO2 = parametros.tasaOxigenoKgHora; // 0.076 kg/h

  const idaBase = parametros.tiempoTramoIdaBaseMin; // 95 min
  const parada1 = mode === "conRover" ? 15 : 30;
  const desvioIda = includeDetour
    ? parametros.tiempoAdicionalDesvioIdaRegresoMin / 2
    : 0;
  const parada2 = includeDetour ? (mode === "conRover" ? 15 : 40) : 0;
  const solarMitad = simulateSolarAlert
    ? parametros.penalizacionAlertaSolarMin / 2
    : 0;

  if (etapa === 1) {
    return {
      etapa: 1,
      titulo: "Etapa 1: Planificación en Punto Seguro (Sol 4476 - PIA26552)",
      subtitulo:
        "Sistemas nominales antes de salir del umbral seguro. Oxígeno al 100% (0.380 kg), Tiempo EVA: 0 min, Batería Rover: 100%.",
      nodoFocoId: "nodo-1-inicio-seguro",
      oxigenoRestanteKg: Number(capO2.toFixed(3)),
      oxigenoRestantePct: 100,
      tiempoAcumuladoMin: 0,
      bateriaRoverPct: 100,
      posicionMapa: {
        xPercent: 16,
        yPercent: 78,
        enTransito: false,
        etiqueta: "EN BASE SEGURA (N1)",
      },
    };
  }

  if (etapa === 2) {
    const tMin = idaBase + solarMitad;
    const o2Usado = (tMin / 60) * tasaO2;
    const o2RestKg = Math.max(0, capO2 - o2Usado);
    const o2RestPct = Number(((o2RestKg / capO2) * 100).toFixed(1));
    const batRover = mode === "conRover" ? 100 - 14 - (simulateSolarAlert ? 3 : 0) : 100;

    return {
      etapa: 2,
      titulo: "Etapa 2: Tránsito de Ida y Rodeo de Obstáculo (>22° - PIA26364)",
      subtitulo: `Descuenta el desplazamiento de ida (${tMin} min a 0.45 km/h) rodeando el talud excluido del Nodo 2 (24.5° > 22°).`,
      nodoFocoId: "nodo-2-obstaculo-riesgo-alto",
      oxigenoRestanteKg: Number(o2RestKg.toFixed(3)),
      oxigenoRestantePct: o2RestPct,
      tiempoAcumuladoMin: tMin,
      bateriaRoverPct: batRover,
      posicionMapa: {
        xPercent: 38,
        yPercent: 69,
        enTransito: true,
        etiqueta: "RODEANDO N2 (>22°)",
      },
    };
  }

  if (etapa === 3) {
    const tMin = idaBase + parada1 + solarMitad;
    const o2Usado = (tMin / 60) * tasaO2;
    const o2RestKg = Math.max(0, capO2 - o2Usado);
    const o2RestPct = Number(((o2RestKg / capO2) * 100).toFixed(1));
    const batRover =
      mode === "conRover" ? 100 - 14 - 16 - (simulateSolarAlert ? 3 : 0) : 100;

    return {
      etapa: 3,
      titulo: "Etapa 3: Parada Científica 1: Red Mineral Boxwork (Sol 4541 - PIA26558)",
      subtitulo:
        mode === "conRover"
          ? "Con Rover: el pre-escaneo óptico y transporte instrumental reduce la parada científica de 30 min a 15 min (-16% batería rover)."
          : "Astronauta Solo: la inspección y muestreo manual de crestas minerales consume 30 min completos de soporte vital.",
      nodoFocoId: "nodo-3-ciencia-boxwork",
      oxigenoRestanteKg: Number(o2RestKg.toFixed(3)),
      oxigenoRestantePct: o2RestPct,
      tiempoAcumuladoMin: tMin,
      bateriaRoverPct: batRover,
      posicionMapa: {
        xPercent: 58,
        yPercent: 60,
        enTransito: false,
        etiqueta: "CIENCIA 1 (N3)",
      },
    };
  }

  if (etapa === 4) {
    const tMin = idaBase + parada1 + desvioIda + parada2 + solarMitad;
    const o2Usado = (tMin / 60) * tasaO2;
    const o2RestKg = Math.max(0, capO2 - o2Usado);
    const o2RestPct = Number(((o2RestKg / capO2) * 100).toFixed(1));
    const batRover =
      mode === "conRover"
        ? 70 - (includeDetour ? 18 : 0) - (simulateSolarAlert ? 3 : 0)
        : 100;

    return {
      etapa: 4,
      titulo:
        "Etapa 4: Punto de Decisión: ¿Tomar Desvío Simulado hacia Nódulos (PIA26697)?",
      subtitulo: includeDetour
        ? mode === "conRover"
          ? `Desvío ACTIVO en modo Con Rover: parada reducida a 15 min. Proyección al retorno conserva ${simulation.oxigeno.oxigenoRestantePorcentaje}% de O2 (>=25% seguro).`
          : `Desvío ACTIVO en modo Astronauta Solo: +40 min de muestreo + 25 min de marcha; al regresar el O2 caerá a ${simulation.oxigeno.oxigenoRestantePorcentaje}% (<25% reserva).`
        : "Evaluando Regla de 4 Pasos en tiempo real. Puedes activar o desactivar el desvío hacia el Nodo 4 aquí mismo antes de emprender el regreso.",
      nodoFocoId: "nodo-4-desvio-nodulos",
      oxigenoRestanteKg: Number(o2RestKg.toFixed(3)),
      oxigenoRestantePct: o2RestPct,
      tiempoAcumuladoMin: tMin,
      bateriaRoverPct: batRover,
      posicionMapa: includeDetour
        ? {
            xPercent: 82,
            yPercent: 48,
            enTransito: false,
            etiqueta: "MUESTREO DESVÍO (N4)",
          }
        : {
            xPercent: 58,
            yPercent: 60,
            enTransito: false,
            etiqueta: "EVALUANDO DESVÍO",
          },
    };
  }

  // Etapa 5: Regreso al Punto Seguro y Dictamen Final
  return {
    etapa: 5,
    titulo: "Etapa 5: Regreso al Punto Seguro y Dictamen Final",
    subtitulo: simulation.estadoMision.esExitosa
      ? `Retorno completado a Nodo 1 con ${simulation.oxigeno.oxigenoRestantePorcentaje}% de O2 (${simulation.oxigeno.oxigenoRestanteKg} kg) por encima del umbral mínimo del 25%.`
      : `Alerta crítica al retornar a Nodo 1: O2 final en ${simulation.oxigeno.oxigenoRestantePorcentaje}% (${simulation.oxigeno.oxigenoRestanteKg} kg), perforando la reserva obligatoria del 25%.`,
    nodoFocoId: "nodo-1-inicio-seguro",
    oxigenoRestanteKg: simulation.oxigeno.oxigenoRestanteKg,
    oxigenoRestantePct: simulation.oxigeno.oxigenoRestantePorcentaje,
    tiempoAcumuladoMin: simulation.desgloseTiempoMin.tiempoTotalEvaMin,
    bateriaRoverPct: simulation.rover.energiaRoverRestantePorcentaje,
    posicionMapa: {
      xPercent: 16,
      yPercent: 78,
      enTransito: false,
      etiqueta: "RETORNO EN BASE (N1)",
    },
  };
}

interface EvaSequencePlayerProps {
  etapaActual: number;
  onChangeEtapa: (etapa: number) => void;
  estadoEtapa: EstadoEtapaEva;
  mode: MissionMode;
  onChangeMode: (mode: MissionMode) => void;
  includeDetour: boolean;
  onToggleDetour: () => void;
  simulation: MissionSimulationResult;
}

export function EvaSequencePlayer({
  etapaActual,
  onChangeEtapa,
  estadoEtapa,
  mode,
  onChangeMode,
  includeDetour,
  onToggleDetour,
  simulation,
}: EvaSequencePlayerProps) {
  const { evaluacionDesvio, estadoMision } = simulation;

  return (
    <section className="rounded-2xl border-2 border-cyan-500/50 bg-slate-900/95 px-3.5 py-2.5 font-mono shadow-lg">
      {/* FILA SUPERIOR: BOTONES GRANDES PARA GUANTES + INDICADOR DE LAS 5 ETAPAS + MÉTRICAS DE ETAPA */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Controles Secuenciales para Guantes Presurizados */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            disabled={etapaActual <= 1}
            onClick={() => onChangeEtapa(Math.max(1, etapaActual - 1))}
            className="min-h-[42px] rounded-xl border-2 border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-black text-slate-100 transition-all hover:border-cyan-400 active:scale-95 disabled:opacity-40"
          >
            [◀ Paso Anterior]
          </button>

          <button
            type="button"
            disabled={etapaActual >= 5}
            onClick={() => onChangeEtapa(Math.min(5, etapaActual + 1))}
            className="min-h-[42px] rounded-xl border-2 border-cyan-400 bg-cyan-500/25 px-3.5 py-1.5 text-xs font-black text-white shadow-[0_0_15px_rgba(34,211,238,0.25)] transition-all hover:bg-cyan-500/35 active:scale-95 disabled:opacity-40"
          >
            [▶ Siguiente Etapa EVA]
          </button>

          <button
            type="button"
            onClick={() => onChangeEtapa(1)}
            className="min-h-[42px] rounded-xl border-2 border-amber-500/60 bg-amber-950/50 px-3 py-1.5 text-xs font-black text-amber-200 transition-all hover:border-amber-400 active:scale-95"
          >
            [↺ Reiniciar Misión]
          </button>
        </div>

        {/* Selector directo de las 5 Etapas */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => onChangeEtapa(step)}
              className={`h-9 w-9 rounded-lg border font-mono text-xs font-black transition-all ${
                etapaActual === step
                  ? "border-cyan-300 bg-cyan-400 text-slate-950 shadow-[0_0_10px_#22d3ee]"
                  : step < etapaActual
                  ? "border-emerald-500/60 bg-emerald-950/60 text-emerald-300"
                  : "border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-500"
              }`}
            >
              E{step}
            </button>
          ))}
        </div>

        {/* Telemetría instantánea acumulada en la Etapa Actual */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-1.5 text-xs">
          <span className="text-slate-400">EN ETAPA {etapaActual}/5:</span>
          <span
            className={`font-black ${
              estadoEtapa.oxigenoRestantePct < 25
                ? "text-rose-400"
                : "text-emerald-300"
            }`}
          >
            O2: {estadoEtapa.oxigenoRestantePct}% (
            {estadoEtapa.oxigenoRestanteKg.toFixed(3)} kg)
          </span>
          <span className="text-slate-600">|</span>
          <span className="font-black text-cyan-300">
            Tiempo EVA: {estadoEtapa.tiempoAcumuladoMin} min
          </span>
          <span className="text-slate-600">|</span>
          <span className="font-black text-amber-300">
            Batería Rover:{" "}
            {mode === "conRover"
              ? `${estadoEtapa.bateriaRoverPct}%`
              : "100% (Base)"}
          </span>
        </div>
      </div>

      {/* FILA INFERIOR: TÍTULO DE ETAPA + PANEL INTERACTIVO EN ETAPA 4 Y SELLO FINAL EN ETAPA 5 */}
      <div className="mt-2 flex flex-col justify-between gap-2 border-t border-slate-800 pt-2 lg:flex-row lg:items-center">
        <div>
          <h3 className="text-xs sm:text-sm font-black text-white">
            {estadoEtapa.titulo}
          </h3>
          <p className="mt-0.5 text-[11px] text-slate-300">
            {estadoEtapa.subtitulo}
          </p>
        </div>

        {/* CONTROLES CONTEXTUALES DE ETAPA 4 (PUNTO DE DECISIÓN DE DESVÍO) */}
        {etapaActual === 4 && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-400/60 bg-amber-950/30 px-3 py-1.5">
            <button
              type="button"
              onClick={onToggleDetour}
              className={`rounded-lg border-2 px-3 py-1 text-xs font-black transition-all active:scale-95 ${
                includeDetour
                  ? "border-amber-300 bg-amber-400 text-slate-950"
                  : "border-slate-600 bg-slate-900 text-amber-200"
              }`}
            >
              {includeDetour
                ? "✓ Desvío PIA26697: ACTIVADO"
                : "+ Activar Desvío PIA26697"}
            </button>

            <button
              type="button"
              onClick={() =>
                onChangeMode(mode === "solo" ? "conRover" : "solo")
              }
              className="rounded-lg border border-cyan-400/60 bg-slate-900 px-2.5 py-1 text-xs font-bold text-cyan-200 hover:bg-slate-800"
            >
              Comparar en vivo:{" "}
              {mode === "solo" ? "Cambiar a Con Rover" : "Cambiar a Solo"}
            </button>

            <span
              className={`rounded px-2 py-0.5 text-[10px] font-black ${
                evaluacionDesvio.paso4ExplicacionTransparente.recomendado
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-rose-500/30 text-rose-200 border border-rose-500/50"
              }`}
            >
              {evaluacionDesvio.paso4ExplicacionTransparente.recomendado
                ? "REGLA 4 PASOS: VIABLE (CON ROVER)"
                : "REGLA 4 PASOS: PERFORA RESERVA 25% (SOLO)"}
            </span>
          </div>
        )}

        {/* SELLO FINAL EN ETAPA 5 (REGRESO AL PUNTO SEGURO Y DICTAMEN FINAL) */}
        {etapaActual === 5 && (
          <div
            className={`flex items-center gap-2 rounded-xl border-2 px-4 py-1.5 text-xs font-black uppercase tracking-wider shadow-lg ${
              estadoMision.esExitosa
                ? "border-emerald-400 bg-emerald-500/25 text-emerald-200"
                : "animate-pulse border-rose-500 bg-rose-600/30 text-rose-100"
            }`}
          >
            <span>
              {estadoMision.esExitosa
                ? "✓ ÉXITO DE MISIÓN (Reserva conservada)"
                : "✕ FALLO DE SEGURIDAD (Reserva perforada)"}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
