"use client";

import React, { useState } from "react";
import { DecisionEnginePanel } from "~/components/DecisionEnginePanel";
import type {
  DetourEvaluationResult,
  MissionMode,
  MissionSimulationParameters,
  MissionSimulationResult,
} from "~/types/mission";

interface TopTelemetryBarProps {
  children?: React.ReactNode;
  mode: MissionMode;
  includeDetour: boolean;
  onToggleDetour: () => void;
  simulateSolarAlert: boolean;
  onToggleSolarAlert: () => void;
  onOpenScientificAudit: () => void;
  simulation: MissionSimulationResult;
  evaluacionDesvio: DetourEvaluationResult;
  parametros: MissionSimulationParameters;
}

export function TopTelemetryBar({
  children,
  mode,
  includeDetour,
  onToggleDetour,
  simulateSolarAlert,
  onToggleSolarAlert,
  onOpenScientificAudit,
  simulation,
  evaluacionDesvio,
  parametros,
}: TopTelemetryBarProps) {
  const [metricasAbiertas, setMetricasAbiertas] = useState(false);
  const { oxigeno, desgloseTiempoMin, rover } = simulation;
  const tiempoMaximoMin = 300;
  const energiaRoverActual =
    mode === "conRover" ? rover.energiaRoverRestantePorcentaje : 100;

  return (
    <header className="flex flex-col gap-3 font-mono">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
            Curiosity MSL · Cráter Gale, Marte
          </p>
          <h1 className="mt-1 text-base font-bold text-slate-100 sm:text-lg">
            Mount Sharp — sector boxwork
          </h1>
        </div>

        <button
          type="button"
          onClick={onOpenScientificAudit}
          className="min-h-11 rounded-xl border border-[#f07eb4] px-4 py-2 text-sm font-medium text-[#f07eb4] transition-colors hover:bg-rose-950/30"
        >
          Abrir auditoría científica ↗
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onToggleDetour}
          aria-pressed={includeDetour}
          className={`flex min-h-11 items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left text-xs transition-colors sm:min-w-[260px] ${
            includeDetour
              ? "border-cyan-400 bg-cyan-400 text-slate-950"
              : "border-slate-800 bg-slate-900 text-slate-200 hover:border-slate-600"
          }`}
        >
          <span>Desvío científico · PIA26697</span>
          <span className="font-bold">{includeDetour ? "Activo" : "Off"}</span>
        </button>

        <button
          type="button"
          onClick={onToggleSolarAlert}
          aria-pressed={simulateSolarAlert}
          className={`flex min-h-11 items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left text-xs transition-colors sm:min-w-[260px] ${
            simulateSolarAlert
              ? "border-[#f07eb4] bg-rose-950/30 text-[#e98bb7]"
              : "border-slate-800 bg-slate-900 text-slate-200 hover:border-slate-600"
          }`}
        >
          <span>Simular alerta de radiación</span>
          <span className="font-bold">{simulateSolarAlert ? "Activo" : "Off"}</span>
        </button>
      </div>

      {children}

      {/* BARRA COMPACTA DE DICTAMEN + DESPLEGABLE PARA LAS 3 MÉTRICAS PROYECTADAS */}
      <div className="flex flex-col gap-2.5">
        <DecisionEnginePanel
          mode={mode}
          evaluacionDesvio={evaluacionDesvio}
          metricasAbiertas={metricasAbiertas}
          onToggleMetricas={() => setMetricasAbiertas((prev) => !prev)}
          resumenMetricas={{
            oxigenoPorcentaje: oxigeno.oxigenoRestantePorcentaje,
            perforaReserva25: oxigeno.perforaReserva25,
            tiempoTotalEvaMin: desgloseTiempoMin.tiempoTotalEvaMin,
            energiaRoverPorcentaje: energiaRoverActual,
          }}
        />

        {metricasAbiertas && (
          <div className="flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-[11px] uppercase tracking-wider text-slate-400">
                  O₂ proyectado al regreso
                </p>
                <p
                  className={`mt-2 text-2xl font-bold sm:text-3xl ${
                    oxigeno.perforaReserva25 ? "text-rose-300" : "text-emerald-300"
                  }`}
                >
                  {oxigeno.oxigenoRestantePorcentaje}%
                </p>
                <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full ${
                      oxigeno.perforaReserva25 ? "bg-rose-400" : "bg-emerald-300"
                    }`}
                    style={{
                      width: `${Math.min(100, oxigeno.oxigenoRestantePorcentaje)}%`,
                    }}
                  />
                  <span
                    className="absolute bottom-0 top-0 w-0.5 bg-white"
                    style={{ left: `${oxigeno.reservaMinimaPorcentaje}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  {oxigeno.oxigenoRestanteKg.toFixed(3)} kg al volver · reserva mínima{" "}
                  {oxigeno.reservaMinimaPorcentaje}%
                </p>
              </section>

              <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-[11px] uppercase tracking-wider text-slate-400">
                  Tiempo total de EVA
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-100 sm:text-3xl">
                  {desgloseTiempoMin.tiempoTotalEvaMin} min
                </p>
                <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-slate-800">
                  <span
                    className="bg-cyan-400"
                    style={{
                      width: `${(desgloseTiempoMin.idaMin / tiempoMaximoMin) * 100}%`,
                    }}
                    title={`Ida: ${desgloseTiempoMin.idaMin} min`}
                  />
                  <span
                    className="bg-[#f07eb4]"
                    style={{
                      width: `${(desgloseTiempoMin.paradasCientificasMin / tiempoMaximoMin) * 100}%`,
                    }}
                    title={`Ciencia: ${desgloseTiempoMin.paradasCientificasMin} min`}
                  />
                  <span
                    className="bg-emerald-300"
                    style={{
                      width: `${(desgloseTiempoMin.regresoMin / tiempoMaximoMin) * 100}%`,
                    }}
                    title={`Regreso: ${desgloseTiempoMin.regresoMin} min`}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Ida {desgloseTiempoMin.idaMin} + Ciencia{" "}
                  {desgloseTiempoMin.paradasCientificasMin} + Regreso{" "}
                  {desgloseTiempoMin.regresoMin} min · tope 300
                </p>
              </section>

              <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-[11px] uppercase tracking-wider text-slate-400">
                  Energía del rover
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-100 sm:text-3xl">
                  {energiaRoverActual}%
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-[#f07eb4]"
                    style={{
                      width: `${Math.min(100, energiaRoverActual)}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  {mode === "conRover"
                    ? `${rover.energiaRoverUsadaPorcentaje}% usado · reserva mínima ${rover.reservaMinimaRoverPorcentaje}%`
                    : "Rover en base · no participa en esta EVA"}
                </p>
              </section>
            </div>

            <p className="px-1 text-[11px] text-slate-500">
              Tasa de oxígeno: {parametros.tasaOxigenoKgHora} kg/h · referencia de magnitud NASA BVAD 2022
            </p>
          </div>
        )}
      </div>
    </header>
  );
}
