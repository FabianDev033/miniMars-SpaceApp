"use client";

import React, { useState } from "react";
import type {
  DetourEvaluationResult,
  MissionMode,
} from "~/types/mission";

interface DecisionEnginePanelProps {
  mode: MissionMode;
  evaluacionDesvio: DetourEvaluationResult;
}

export function DecisionEnginePanel({
  mode,
  evaluacionDesvio,
}: DecisionEnginePanelProps) {
  const [expandido, setExpandido] = useState(false);

  const aprobado = evaluacionDesvio.paso4ExplicacionTransparente.recomendado;

  return (
    <section
      className={`rounded-2xl border-2 px-3.5 py-2.5 font-mono transition-all ${
        aprobado
          ? "border-emerald-500/70 bg-emerald-950/25"
          : "border-rose-500/80 bg-rose-950/30"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded px-2 py-0.5 text-[10px] font-black uppercase ${
              aprobado
                ? "bg-emerald-400 text-slate-950"
                : "bg-rose-500 text-white"
            }`}
          >
            DICTAMEN MOTOR DE DECISIONES (REGLA DE 4 PASOS)
          </span>
          <span className="text-xs font-extrabold text-white">
            {evaluacionDesvio.paso4ExplicacionTransparente.resumenEjecutivo}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setExpandido(!expandido)}
          className="rounded-lg border border-cyan-500/50 bg-slate-900 px-3 py-1 text-xs font-bold text-cyan-300 hover:bg-slate-800 active:scale-95"
        >
          {expandido
            ? "Ocultar Desglose 4 Pasos ▲"
            : "Ver Auditoría Regla de 4 Pasos ▼"}
        </button>
      </div>

      <p className="mt-1 text-[11px] leading-relaxed text-slate-200">
        {evaluacionDesvio.paso4ExplicacionTransparente.justificacionCompleta}
      </p>

      {expandido && (
        <div className="mt-2.5 grid grid-cols-1 gap-2 border-t border-slate-800/90 pt-2.5 md:grid-cols-4 text-[11px]">
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
      )}
    </section>
  );
}
