"use client";

import React from "react";
import type {
  MissionMode,
  MissionSimulationParameters,
  MissionSimulationResult,
} from "~/types/mission";

interface TopTelemetryBarProps {
  mode: MissionMode;
  onChangeMode: (mode: MissionMode) => void;
  includeDetour: boolean;
  onToggleDetour: () => void;
  simulateSolarAlert: boolean;
  onToggleSolarAlert: () => void;
  simulation: MissionSimulationResult;
  parametros: MissionSimulationParameters;
}

export function TopTelemetryBar({
  mode,
  onChangeMode,
  includeDetour,
  onToggleDetour,
  simulateSolarAlert,
  onToggleSolarAlert,
  simulation,
  parametros,
}: TopTelemetryBarProps) {
  const { oxigeno, desgloseTiempoMin, rover, estadoMision } = simulation;
  const esViable = estadoMision.esExitosa;

  return (
    <header className="flex flex-col gap-2 border-b border-slate-800 pb-2.5">
      {/* FILA 1: SELECTOR DE ESCENARIO + CONTROLES DE DESVÍO Y ALERTA + BANNER DE ESTADO */}
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-12">
        {/* Botones Grandes para Guantes: Modo Astronauta Solo vs. Astronauta + Rover */}
        <div className="grid grid-cols-2 gap-2 lg:col-span-5">
          <button
            type="button"
            onClick={() => onChangeMode("solo")}
            className={`flex min-h-[54px] items-center justify-center rounded-xl border-2 px-3 py-2 font-mono text-xs sm:text-sm font-black uppercase tracking-wide transition-all active:scale-95 ${
              mode === "solo"
                ? "border-cyan-400 bg-cyan-500/25 text-white shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                : "border-slate-700 bg-slate-900/80 text-slate-400 hover:border-slate-500"
            }`}
          >
            [Modo: Astronauta Solo]
          </button>

          <button
            type="button"
            onClick={() => onChangeMode("conRover")}
            className={`flex min-h-[54px] items-center justify-center rounded-xl border-2 px-3 py-2 font-mono text-xs sm:text-sm font-black uppercase tracking-wide transition-all active:scale-95 ${
              mode === "conRover"
                ? "border-amber-400 bg-amber-500/25 text-white shadow-[0_0_20px_rgba(251,191,36,0.3)]"
                : "border-slate-700 bg-slate-900/80 text-slate-400 hover:border-slate-500"
            }`}
          >
            [Modo: Astronauta + Rover de Apoyo]
          </button>
        </div>

        {/* Botones Táctiles de Simulación: Desvío PIA26697 y Alerta de Radiación / Reserva */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:col-span-4">
          <button
            type="button"
            onClick={onToggleDetour}
            className={`flex min-h-[54px] items-center justify-between gap-2 rounded-xl border-2 px-3 py-2 text-left font-mono text-xs font-bold transition-all active:scale-95 ${
              includeDetour
                ? "border-amber-400 bg-amber-950/75 text-amber-100 shadow-[0_0_16px_rgba(251,191,36,0.25)]"
                : "border-slate-700 bg-slate-900/80 text-slate-300 hover:border-slate-500"
            }`}
          >
            <span className="leading-tight">
              [Incluir Desvío Científico Simulado (PIA26697)]
            </span>
            <span
              className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-black ${
                includeDetour
                  ? "bg-amber-400 text-slate-950"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {includeDetour ? "ACTIVO" : "OFF"}
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleSolarAlert}
            className={`flex min-h-[54px] items-center justify-between gap-2 rounded-xl border-2 px-3 py-2 text-left font-mono text-xs font-bold transition-all active:scale-95 ${
              simulateSolarAlert
                ? "border-rose-500 bg-rose-950/80 text-rose-100 shadow-[0_0_16px_rgba(244,63,94,0.35)]"
                : "border-slate-700 bg-slate-900/80 text-slate-300 hover:border-slate-500"
            }`}
          >
            <span className="leading-tight">
              [Simular Alerta de Radiación / Reserva]
            </span>
            <span
              className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-black ${
                simulateSolarAlert
                  ? "bg-rose-500 text-white"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {simulateSolarAlert ? "ACTIVO" : "OFF"}
            </span>
          </button>
        </div>

        {/* Banner de Estado de Misión: Verde o Rojo Parpadeante */}
        <div
          className={`flex min-h-[54px] flex-col items-center justify-center rounded-xl border-2 px-3 py-1.5 text-center font-mono lg:col-span-3 ${
            esViable
              ? "border-emerald-400 bg-emerald-950/60 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
              : "animate-pulse border-rose-500 bg-rose-950/85 text-rose-100 shadow-[0_0_25px_rgba(244,63,94,0.5)]"
          }`}
        >
          <span className="text-[11px] font-black uppercase tracking-wider">
            {esViable
              ? "MISIÓN VIABLE - RESERVA SEGURA"
              : "ALERTA: PROYECCIÓN PERFORA RESERVA DE OXÍGENO O RIESGO ALTO"}
          </span>
          <span className="mt-0.5 text-[10px] text-slate-300">
            {esViable
              ? `Margen sobre reserva 25%: +${(
                  oxigeno.oxigenoRestantePorcentaje -
                  oxigeno.reservaMinimaPorcentaje
                ).toFixed(1)}% O2`
              : estadoMision.mensajeAlertaPrincipal ??
                "Retorno por debajo del umbral de seguridad"}
          </span>
        </div>
      </div>

      {/* FILA 2: TRES MEDIDORES PRINCIPALES DE SUPERVIVENCIA EN TIEMPO REAL */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        {/* MEDIDOR 1: OXÍGENO PROYECTADO AL REGRESO (con línea límite del 25%) */}
        <div
          className={`rounded-xl border px-3.5 py-2 ${
            !oxigeno.perforaReserva25
              ? "border-emerald-600/60 bg-slate-900/90"
              : "border-rose-500 bg-rose-950/40"
          }`}
        >
          <div className="flex items-center justify-between font-mono">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
              1. OXÍGENO PROYECTADO AL REGRESO
            </span>
            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-300">
              Tasa: {parametros.tasaOxigenoKgHora} kg/h (BVAD)
            </span>
          </div>

          <div className="mt-1 flex items-baseline justify-between font-mono">
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl font-black ${
                  !oxigeno.perforaReserva25 ? "text-white" : "text-rose-300"
                }`}
              >
                {oxigeno.oxigenoRestantePorcentaje}%
              </span>
              <span className="text-xs font-bold text-cyan-300">
                ({oxigeno.oxigenoRestanteKg.toFixed(3)} kg restantes)
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Usado: {oxigeno.oxigenoUsadoKg.toFixed(3)} /{" "}
              {oxigeno.capacidadInicialKg.toFixed(3)} kg
            </span>
          </div>

          {/* Barra con Línea Límite de Reserva del 25% */}
          <div className="relative mt-1.5 h-3 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                !oxigeno.perforaReserva25 ? "bg-emerald-400" : "bg-rose-500"
              }`}
              style={{
                width: `${Math.min(100, oxigeno.oxigenoRestantePorcentaje)}%`,
              }}
            />
            {/* Línea vertical de Reserva del 25% */}
            <div
              className="absolute bottom-0 top-0 z-10 w-0.5 bg-rose-400 shadow-[0_0_6px_#f43f5e]"
              style={{ left: `${oxigeno.reservaMinimaPorcentaje}%` }}
              title="Límite de Reserva Mínima (25%)"
            />
          </div>
          <div className="mt-1 flex items-center justify-between font-mono text-[10px]">
            <span className="font-bold text-rose-300">
              ▲ Línea Límite Reserva: {oxigeno.reservaMinimaPorcentaje}% (
              {(
                (oxigeno.capacidadInicialKg * oxigeno.reservaMinimaPorcentaje) /
                100
              ).toFixed(3)}{" "}
              kg)
            </span>
            <span className="text-slate-400">[DERIVADO / SIMULADO]</span>
          </div>
        </div>

        {/* MEDIDOR 2: TIEMPO TOTAL DE EVA DESGLOSADO */}
        <div className="rounded-xl border border-cyan-600/60 bg-slate-900/90 px-3.5 py-2 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-300">
              2. TIEMPO TOTAL DE EVA
            </span>
            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-300">
              Vel. caminata idéntica: {parametros.velocidadCaminataKmHora} km/h
            </span>
          </div>

          <div className="mt-1 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">
                {desgloseTiempoMin.tiempoTotalEvaMin} min
              </span>
              <span className="text-xs font-bold text-cyan-300">
                ({(desgloseTiempoMin.tiempoTotalEvaMin / 60).toFixed(2)} h)
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Cap. máx traje: 300 min (5.0 h)
            </span>
          </div>

          {/* Barra segmentada Ida + Ciencia + Regreso */}
          <div className="mt-1.5 flex h-3 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-sky-400 transition-all"
              style={{
                width: `${(desgloseTiempoMin.idaMin / 300) * 100}%`,
              }}
              title={`Ida: ${desgloseTiempoMin.idaMin} min`}
            />
            <div
              className="h-full bg-amber-400 transition-all"
              style={{
                width: `${
                  (desgloseTiempoMin.paradasCientificasMin / 300) * 100
                }%`,
              }}
              title={`Paradas Científicas: ${desgloseTiempoMin.paradasCientificasMin} min`}
            />
            <div
              className="h-full bg-emerald-400 transition-all"
              style={{
                width: `${(desgloseTiempoMin.regresoMin / 300) * 100}%`,
              }}
              title={`Regreso: ${desgloseTiempoMin.regresoMin} min`}
            />
            {desgloseTiempoMin.penalizacionSolarMin > 0 && (
              <div
                className="h-full bg-rose-500 transition-all"
                style={{
                  width: `${
                    (desgloseTiempoMin.penalizacionSolarMin / 300) * 100
                  }%`,
                }}
              />
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center justify-between text-[10px] text-slate-300">
            <span>
              <strong className="text-sky-300">
                Ida: {desgloseTiempoMin.idaMin}m
              </strong>{" "}
              +{" "}
              <strong className="text-amber-300">
                Ciencia: {desgloseTiempoMin.paradasCientificasMin}m
              </strong>{" "}
              +{" "}
              <strong className="text-emerald-300">
                Regreso: {desgloseTiempoMin.regresoMin}m
              </strong>
              {desgloseTiempoMin.penalizacionSolarMin > 0 && (
                <strong className="text-rose-400">
                  {" "}
                  + Alerta: {desgloseTiempoMin.penalizacionSolarMin}m
                </strong>
              )}
            </span>
          </div>
        </div>

        {/* MEDIDOR 3: ENERGÍA DEL ROVER (%) Y FUNCIÓN EXPLÍCITA */}
        <div
          className={`rounded-xl border px-3.5 py-2 font-mono transition-all ${
            mode === "conRover"
              ? "border-amber-500/70 bg-slate-900/90"
              : "border-slate-800 bg-slate-900/50 opacity-75"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
              3. ENERGÍA DEL ROVER (%)
            </span>
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                mode === "conRover"
                  ? "bg-amber-500/20 text-amber-200 border border-amber-500/40"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {mode === "conRover" ? "ROVER ACTIVO [SIMULADO]" : "EN BASE"}
            </span>
          </div>

          <div className="mt-1 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">
                {mode === "conRover"
                  ? `${rover.energiaRoverRestantePorcentaje}%`
                  : "100% (En Base)"}
              </span>
              {mode === "conRover" && (
                <span className="text-xs font-bold text-amber-300">
                  (-{rover.energiaRoverUsadaPorcentaje}% consumido)
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400">
              Reserva mín: {rover.reservaMinimaRoverPorcentaje}%
            </span>
          </div>

          <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                mode === "conRover" ? "bg-amber-400" : "bg-slate-600"
              }`}
              style={{
                width: `${Math.min(
                  100,
                  rover.energiaRoverRestantePorcentaje
                )}%`,
              }}
            />
          </div>

          <p className="mt-1 truncate text-[10px] text-amber-200/90" title="Transporte instrumental y pre-escaneo óptico: reduce tiempo de parada científica">
            Función: Transporte instrumental y pre-escaneo óptico: reduce tiempo
            de parada científica
          </p>
        </div>
      </div>
    </header>
  );
}
