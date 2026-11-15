"use client";

import React, { useState } from "react";
import type {
  DetourEvaluationResult,
  MissionMode,
} from "~/types/mission";

interface ResumenMetricasProyectadas {
  oxigenoPorcentaje: number;
  perforaReserva25: boolean;
  tiempoTotalEvaMin: number;
  energiaRoverPorcentaje: number;
}

interface DecisionEnginePanelProps {
  mode: MissionMode;
  evaluacionDesvio: DetourEvaluationResult;
  metricasAbiertas?: boolean;
  onToggleMetricas?: () => void;
  resumenMetricas?: ResumenMetricasProyectadas;
}

export function DecisionEnginePanel({
  mode,
  evaluacionDesvio,
  metricasAbiertas = false,
  onToggleMetricas,
  resumenMetricas,
}: DecisionEnginePanelProps) {
  const [expandido, setExpandido] = useState(false);

  const aprobado = evaluacionDesvio.paso4ExplicacionTransparente.recomendado;

  return (
    <section
      className={`rounded-2xl border px-4 py-3 font-mono transition-all ${
        aprobado
          ? "border-emerald-400/70 bg-slate-900"
          : "border-rose-400/80 bg-slate-900"
      }`}
    >
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-slate-400">
              Dictamen del motor:
            </span>
            <span
              className={`text-sm font-bold sm:text-base ${
                aprobado ? "text-emerald-300" : "text-rose-300"
              }`}
            >
              {aprobado
                ? "Misión viable · reserva segura"
                : "Alerta · revisar el retorno"}
            </span>
          </div>
          <p className="mt-1 line-clamp-1 text-xs text-slate-300">
            {evaluacionDesvio.paso4ExplicacionTransparente.resumenEjecutivo}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onToggleMetricas && (
            <button
              type="button"
              onClick={onToggleMetricas}
              aria-expanded={metricasAbiertas}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                metricasAbiertas
                  ? "border-cyan-400 bg-cyan-950/50 text-cyan-200"
                  : "border-slate-700 bg-slate-950/60 text-slate-200 hover:border-cyan-400"
              }`}
            >
              <span>
                {metricasAbiertas
                  ? "Ocultar métricas de retorno ↑"
                  : "Ver métricas de retorno (3) ↓"}
              </span>
              {resumenMetricas && (
                <span className="hidden items-center gap-1.5 rounded bg-slate-900 px-2 py-0.5 text-[11px] sm:inline-flex">
                  <span
                    className={
                      resumenMetricas.perforaReserva25
                        ? "font-bold text-rose-300"
                        : "font-bold text-emerald-300"
                    }
                  >
                    O₂ {resumenMetricas.oxigenoPorcentaje}%
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-200">
                    {resumenMetricas.tiempoTotalEvaMin} min
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-[#f07eb4]">
                    Rover {resumenMetricas.energiaRoverPorcentaje}%
                  </span>
                </span>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => setExpandido(!expandido)}
            aria-expanded={expandido}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-cyan-300 transition-colors hover:border-cyan-400"
          >
            {expandido ? "Ocultar regla de 4 pasos ↑" : "Ver regla de 4 pasos ↓"}
          </button>
        </div>
      </div>

      {expandido && (
        <div className="mt-3 border-t border-slate-800 pt-3">
          <p className="mb-3 text-xs leading-relaxed text-slate-300">
            {evaluacionDesvio.paso4ExplicacionTransparente.justificacionCompleta}
          </p>
          <div className="grid grid-cols-1 gap-2 text-[11px] md:grid-cols-2">
          {/* Paso 1 */}
          <div className="rounded-xl border border-slate-700/80 bg-slate-950/85 p-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300">
                1. Viabilidad Reserva
              </span>
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-black ${
                  evaluacionDesvio.paso1ViabilidadReserva.aprobado
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-rose-500/30 text-rose-300"
                }`}
              >
                {evaluacionDesvio.paso1ViabilidadReserva.aprobado
                  ? "APROBADO"
                  : "RECHAZADO (<25%)"}
              </span>
            </div>
            <p className="mt-1 text-slate-300">
              {evaluacionDesvio.paso1ViabilidadReserva.detalle}
            </p>
          </div>

          {/* Paso 2 */}
          <div className="rounded-xl border border-slate-700/80 bg-slate-950/85 p-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-300">
                2. Filtro Riesgo &gt;22°
              </span>
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-black text-emerald-300">
                NODO 2 EXCLUIDO
              </span>
            </div>
            <p className="mt-1 text-slate-300">
              {evaluacionDesvio.paso2ExclusionRiesgoAlto.detalle}
            </p>
          </div>

          {/* Paso 3 */}
          <div className="rounded-xl border border-slate-700/80 bg-slate-950/85 p-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300">
                3. Ciencia vs. Costo
              </span>
              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-black text-amber-300">
                +{evaluacionDesvio.paso3ComparacionCienciaCosto.tiempoAdicionalMin}{" "}
                MIN
              </span>
            </div>
            <p className="mt-1 text-slate-300">
              {evaluacionDesvio.paso3ComparacionCienciaCosto.detalle}
            </p>
          </div>

          {/* Paso 4 */}
          <div className="rounded-xl border border-slate-700/80 bg-slate-950/85 p-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300">
                4. Modo {mode === "conRover" ? "Con Rover" : "Solo"}
              </span>
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-black ${
                  aprobado
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-rose-500/30 text-rose-300"
                }`}
              >
                {aprobado ? "DESVÍO RECOMENDADO" : "DESVÍO NO VIABLE"}
              </span>
            </div>
            <p className="mt-1 text-slate-300">
              {evaluacionDesvio.paso3ComparacionCienciaCosto.beneficioCientifico}
            </p>
          </div>
          </div>
        </div>
      )}
    </section>
  );
}
