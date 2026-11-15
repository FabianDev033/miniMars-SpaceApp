"use client";

import React from "react";
import type { DataOrigin, TelemetryRecord } from "~/types/mission";

const ESTILOS_CLASIFICACION: Record<
  DataOrigin,
  { badge: string; label: string; border: string }
> = {
  medido: {
    badge: "bg-emerald-950/90 text-emerald-300 border-emerald-500/70",
    label: "[MEDIDO]",
    border: "border-emerald-800/60",
  },
  derivado: {
    badge: "bg-transparent text-cyan-300 border-cyan-400",
    label: "[DERIVADO]",
    border: "border-sky-800/60",
  },
  simulado: {
    badge: "bg-transparent text-violet-300 border-violet-400",
    label: "[SIMULADO]",
    border: "border-amber-800/60",
  },
};

export function TarjetaDatoTrazable({
  registro,
  compacto = false,
}: {
  registro: TelemetryRecord;
  compacto?: boolean;
}) {
  const estilo = ESTILOS_CLASIFICACION[registro.clasificacion];
  const sinCobertura = registro.valor === null;

  return (
    <div
      className={`rounded-xl border bg-slate-900/90 p-3 transition-all ${
        sinCobertura ? "border-slate-600/80 bg-slate-900/70" : estilo.border
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
          {registro.nombre}
        </span>
        <span
          className={`rounded border px-2 py-0.5 font-mono text-[10px] font-extrabold tracking-wider ${estilo.badge}`}
        >
          {estilo.label}
        </span>
      </div>

      <div className="mt-2">
        {sinCobertura ? (
          <div className="rounded-lg border border-slate-600 bg-slate-800/90 px-3 py-2 text-slate-200">
            <p className="font-mono text-xs font-bold text-slate-200">
              Sin cobertura/medición directa del instrumento en esta ubicación
              (No extrapolado)
            </p>
            {registro.notaCobertura && (
              <p className="mt-1 text-[11px] text-slate-400">
                {registro.notaCobertura}
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-base font-black text-white">
              {registro.valor}
            </span>
            <span className="font-mono text-xs font-semibold text-cyan-300">
              {registro.unidad}
            </span>
          </div>
        )}
      </div>

      {!compacto && (
        <div className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1 border-t border-slate-800/90 pt-2 font-mono text-[11px] text-slate-400">
          <div>
            <span className="font-semibold text-slate-500">Sol/Fecha: </span>
            <span className="text-slate-200">{registro.fechaOSol}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-500">Instrumento: </span>
            <span className="text-slate-200">{registro.instrumento}</span>
          </div>
          <div className="col-span-2 flex items-center justify-between pt-0.5">
            <span className="truncate">
              <span className="font-semibold text-slate-500">Ubicación: </span>
              {registro.ubicacion}
            </span>
            <a
              href={registro.fuenteUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-2 shrink-0 rounded border border-cyan-500/40 bg-slate-800 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-300 hover:bg-slate-700"
            >
              Fuente NASA ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
