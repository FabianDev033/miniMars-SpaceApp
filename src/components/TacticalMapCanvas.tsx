"use client";

import dynamic from "next/dynamic";
import React, { useState } from "react";
import { ElevationProfile } from "~/components/ElevationProfile";
import type { EstadoEtapaEva } from "~/components/EvaSequencePlayer";
import type {
  MissionMode,
  MissionSimulationResult,
  WaypointNode,
} from "~/types/mission";

// Carga dinámica sin SSR para el motor Leaflet WMTS de NASA/JPL Mars Trek
const MarsTrekLeafletMap = dynamic(
  () => import("~/components/MarsTrekLeafletMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[265px] w-full items-center justify-center rounded-2xl border-2 border-slate-700 bg-[#211009] font-mono text-xs text-cyan-300">
        Conectando con API WMTS de NASA/JPL Mars Trek (EPSG:4326)...
      </div>
    ),
  }
);

interface TacticalMapCanvasProps {
  nodos: WaypointNode[];
  nodoSeleccionadoId: string;
  onSelectNodo: (id: string) => void;
  includeDetour: boolean;
  simulation: MissionSimulationResult;
  mode: MissionMode;
  estadoEtapa: EstadoEtapaEva;
}

export function TacticalMapCanvas({
  nodos,
  nodoSeleccionadoId,
  onSelectNodo,
  includeDetour,
  simulation,
  mode,
  estadoEtapa,
}: TacticalMapCanvasProps) {
  const [capa41Activa, setCapa41Activa] = useState(true);
  const [opacidad41, setOpacidad41] = useState(95);

  const [capa42Activa, setCapa42Activa] = useState(true);
  const [opacidad42, setOpacidad42] = useState(95);

  const [capa43Activa, setCapa43Activa] = useState(true);
  const [opacidad43, setOpacidad43] = useState(75);

  return (
    <div className="flex h-full flex-col justify-between gap-2">
      {/* BARRA DE CONTROL DE LAS 3 CAPAS WMTS DE NASA MARS TREK (ENCENDER/APAGAR + OPACIDAD) */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {/* Control Capa 4.1: Satélite Viking + Topografía MOLA WMTS */}
        <div
          className={`flex flex-col justify-between rounded-xl border-2 px-3 py-1.5 font-mono transition-all ${
            capa41Activa
              ? "border-cyan-500/80 bg-slate-900/90"
              : "border-slate-800 bg-slate-950/70 opacity-60"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setCapa41Activa(!capa41Activa)}
              className="flex items-center gap-2 text-left text-xs font-extrabold uppercase text-cyan-300"
            >
              <span
                className={`inline-block h-3.5 w-3.5 rounded border ${
                  capa41Activa
                    ? "border-cyan-300 bg-cyan-400"
                    : "border-slate-600 bg-transparent"
                }`}
              />
              4.1 WMTS: Satélite + MOLA
            </button>
            <span className="text-[11px] font-bold text-slate-300">
              {capa41Activa ? `${opacidad41}%` : "OFF"}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[10px] text-slate-400">Opacidad</span>
            <input
              type="range"
              min={20}
              max={100}
              value={opacidad41}
              disabled={!capa41Activa}
              onChange={(e) => setOpacidad41(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer accent-cyan-400"
            />
          </div>
        </div>

        {/* Control Capa 4.2: Seguridad (RAD / REMS Puntual sobre los nodos) */}
        <div
          className={`flex flex-col justify-between rounded-xl border-2 px-3 py-1.5 font-mono transition-all ${
            capa42Activa
              ? "border-emerald-500/80 bg-slate-900/90"
              : "border-slate-800 bg-slate-950/70 opacity-60"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setCapa42Activa(!capa42Activa)}
              className="flex items-center gap-2 text-left text-xs font-extrabold uppercase text-emerald-300"
            >
              <span
                className={`inline-block h-3.5 w-3.5 rounded border ${
                  capa42Activa
                    ? "border-emerald-300 bg-emerald-400"
                    : "border-slate-600 bg-transparent"
                }`}
              />
              4.2 Sensores RAD / REMS
            </button>
            <span className="text-[11px] font-bold text-slate-300">
              {capa42Activa ? `${opacidad42}%` : "OFF"}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[10px] text-slate-400">Opacidad</span>
            <input
              type="range"
              min={20}
              max={100}
              value={opacidad42}
              disabled={!capa42Activa}
              onChange={(e) => setOpacidad42(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer accent-emerald-400"
            />
          </div>
        </div>

        {/* Control Capa 4.3: Térmica THEMIS WMTS + Red Geológica Boxwork */}
        <div
          className={`flex flex-col justify-between rounded-xl border-2 px-3 py-1.5 font-mono transition-all ${
            capa43Activa
              ? "border-amber-500/80 bg-slate-900/90"
              : "border-slate-800 bg-slate-950/70 opacity-60"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setCapa43Activa(!capa43Activa)}
              className="flex items-center gap-2 text-left text-xs font-extrabold uppercase text-amber-300"
            >
              <span
                className={`inline-block h-3.5 w-3.5 rounded border ${
                  capa43Activa
                    ? "border-amber-300 bg-amber-400"
                    : "border-slate-600 bg-transparent"
                }`}
              />
              4.3 WMTS: THEMIS + Boxwork
            </button>
            <span className="text-[11px] font-bold text-slate-300">
              {capa43Activa ? `${opacidad43}%` : "OFF"}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[10px] text-slate-400">Opacidad</span>
            <input
              type="range"
              min={15}
              max={100}
              value={opacidad43}
              disabled={!capa43Activa}
              onChange={(e) => setOpacidad43(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer accent-amber-400"
            />
          </div>
        </div>
      </div>

      {/* MAPA SATELITAL INTERACTIVO CONECTADO A NASA/JPL MARS TREK WMTS */}
      <div className="min-h-[265px] flex-1">
        <MarsTrekLeafletMap
          nodos={nodos}
          nodoSeleccionadoId={nodoSeleccionadoId}
          onSelectNodo={onSelectNodo}
          includeDetour={includeDetour}
          simulation={simulation}
          mode={mode}
          estadoEtapa={estadoEtapa}
          capa41Activa={capa41Activa}
          opacidad41={opacidad41}
          capa42Activa={capa42Activa}
          opacidad42={opacidad42}
          capa43Activa={capa43Activa}
          opacidad43={opacidad43}
        />
      </div>

      {/* PERFIL DE ELEVACIÓN Y PENDIENTE DEL RECORRIDO (MOLA / MARS TREK) */}
      <ElevationProfile
        nodos={nodos}
        nodoSeleccionadoId={nodoSeleccionadoId}
        onSelectNodo={onSelectNodo}
        etapaActual={estadoEtapa.etapa}
        includeDetour={includeDetour}
      />
    </div>
  );
}
