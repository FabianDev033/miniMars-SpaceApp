"use client";

import React, { useEffect, useState } from "react";
import { TarjetaDatoTrazable } from "~/components/TelemetryBadgeCard";
import type { WaypointNode } from "~/types/mission";

interface NodeAuditDrawerProps {
  nodo: WaypointNode;
  nodos: WaypointNode[];
  onSelectNodo: (id: string) => void;
}

type FiltroCapaNodo =
  | "TODAS"
  | "movilidadTerreno"
  | "seguridadSupervivencia"
  | "interesCientifico";

export function NodeAuditDrawer({
  nodo,
  nodos,
  onSelectNodo,
}: NodeAuditDrawerProps) {
  const [visorCascoHudActivo, setVisorCascoHudActivo] = useState(true);
  const [filtroCapa, setFiltroCapa] = useState<FiltroCapaNodo>("TODAS");
  const [imagenRealDisponible, setImagenRealDisponible] = useState(true);

  useEffect(() => {
    setImagenRealDisponible(true);
  }, [nodo.id]);

  const esPeligroAlto =
    nodo.riesgoTramo.nivel === "alto" || nodo.riesgoTramo.pendienteGrados > 22;

  return (
    <div className="flex h-full flex-col justify-between gap-2.5 overflow-hidden">
      {/* CABECERA DE AUDITORÍA DEL NODO Y SELECTOR RÁPIDO CON GUANTES */}
      <div className="border-b border-slate-800 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-1.5 font-mono">
          <span className="rounded border border-cyan-500/50 bg-cyan-950/80 px-2 py-0.5 text-[11px] font-black text-cyan-300">
            NODO {nodo.orden} • {nodo.imagenPov.codigoPia}
          </span>
          <span
            className={`rounded border px-2 py-0.5 text-[10px] font-extrabold ${
              nodo.esRutaHistoricaCuriosity
                ? "border-emerald-500/50 bg-emerald-950/80 text-emerald-300"
                : "border-amber-500/50 bg-amber-950/80 text-amber-300"
            }`}
          >
            {nodo.esRutaHistoricaCuriosity
              ? "RUTA HISTÓRICA CURIOSITY"
              : "DESVÍO SIMULADO (SOBRE MAPA REAL)"}
          </span>
        </div>

        <h2 className="mt-1 font-mono text-sm sm:text-base font-black text-white">
          {nodo.nombre}
        </h2>

        {/* Botones rápidos N1..N4 para cambio con guantes */}
        <div className="mt-2 grid grid-cols-4 gap-1.5 font-mono">
          {nodos.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => onSelectNodo(n.id)}
              className={`min-h-[38px] rounded-lg border text-xs font-extrabold transition-all active:scale-95 ${
                n.id === nodo.id
                  ? "border-cyan-400 bg-cyan-500/25 text-white"
                  : "border-slate-800 bg-slate-950/80 text-slate-400 hover:border-slate-600"
              }`}
            >
              N{n.orden} ({n.imagenPov.codigoPia})
            </button>
          ))}
        </div>
      </div>

      {/* VISOR POV EN PRIMERA PERSONA DE CURIOSITY CON MARCO "VISOR DE CASCO (HUD)" */}
      <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-xl border-2 border-slate-700 bg-[#1a110e]">
        {/* Fallback visual marciano de alta fidelidad si la imagen local aún no está en /public/imagenes */}
        <svg
          viewBox="0 0 400 180"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient id="martianSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2c1d19" />
              <stop offset="50%" stopColor="#6b3e26" />
              <stop offset="100%" stopColor="#3c2218" />
            </linearGradient>
          </defs>
          <rect width="400" height="180" fill="url(#martianSky)" />
          {/* Horizonte y afloramientos de Mount Sharp */}
          <polygon
            points="0,115 65,82 145,98 235,68 325,88 400,72 400,180 0,180"
            fill="#4a2819"
          />
          {/* Nervaduras poligonales Boxwork o bloques angulares según el nodo */}
          <path
            d="M 20 165 L 110 122 L 210 148 L 310 118 L 385 152"
            fill="none"
            stroke="#d97706"
            strokeWidth="2.5"
            strokeOpacity="0.65"
          />
          <path
            d="M 75 175 L 155 130 L 265 162 L 350 125"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.8"
            strokeOpacity="0.5"
          />
        </svg>

        {imagenRealDisponible && (
          <img
            src={nodo.imagenPov.archivoLocal}
            alt={nodo.imagenPov.titulo}
            onError={() => setImagenRealDisponible(false)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {/* Superposición opcional tipo "Visor de Casco (HUD)" */}
        {visorCascoHudActivo && (
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/75 p-2.5 font-mono">
            <div className="flex items-center justify-between text-[10px]">
              <span className="rounded border border-cyan-400/60 bg-slate-950/85 px-2 py-0.5 font-bold text-cyan-300">
                HUD CASCO EVA // {nodo.imagenPov.camara} • {nodo.imagenPov.sol}
              </span>
              <span
                className={`rounded border px-2 py-0.5 font-black ${
                  esPeligroAlto
                    ? "border-rose-400 bg-rose-950/90 text-rose-200"
                    : "border-emerald-400/60 bg-emerald-950/85 text-emerald-300"
                }`}
              >
                PENDIENTE: {nodo.riesgoTramo.pendienteGrados}° (
                {nodo.riesgoTramo.nivel.toUpperCase()})
              </span>
            </div>

            {/* Retícula central de objetivo geológico o alerta de peligro */}
            <div className="my-auto flex items-center justify-center">
              <div
                className={`flex items-center gap-2 rounded-lg border-2 border-dashed px-3 py-1.5 backdrop-blur-sm ${
                  esPeligroAlto
                    ? "border-rose-500 bg-rose-950/60 text-rose-200"
                    : "border-cyan-400/80 bg-slate-950/55 text-cyan-200"
                }`}
              >
                <span className="text-xs font-black uppercase">
                  {esPeligroAlto
                    ? "⚠ PELIGRO DE TERRENO (>22° - EXCLUSIÓN)"
                    : `⊕ OBJETIVO GEOLÓGICO: ${nodo.imagenPov.codigoPia}`}
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-slate-700/80 bg-slate-950/85 px-2.5 py-1 text-[10px] text-slate-200">
              <p className="font-bold text-white">{nodo.imagenPov.titulo}</p>
              <p className="text-slate-300">{nodo.imagenPov.descripcionHud}</p>
            </div>
          </div>
        )}

        {/* Botón para encender/apagar el marco Visor de Casco (HUD) */}
        <button
          type="button"
          onClick={() => setVisorCascoHudActivo(!visorCascoHudActivo)}
          className="absolute right-2 top-9 z-10 rounded-lg border border-cyan-400/60 bg-slate-950/90 px-2 py-1 font-mono text-[10px] font-bold text-cyan-200 hover:bg-slate-800"
        >
          {visorCascoHudActivo ? "HUD Casco: ON" : "HUD Casco: OFF"}
        </button>
      </div>

      {/* FILTRO DE REGISTROS POR CAPA Y LISTA DE AUDITORÍA CIENTÍFICA */}
      <div className="grid grid-cols-4 gap-1 font-mono text-[10px]">
        {(
          [
            { id: "TODAS", label: "TODAS (3 CAPAS)" },
            { id: "movilidadTerreno", label: "4.1 TERRENO" },
            { id: "seguridadSupervivencia", label: "4.2 SEGURIDAD" },
            { id: "interesCientifico", label: "4.3 CIENCIA" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFiltroCapa(tab.id)}
            className={`rounded-lg border py-1.5 font-extrabold transition-all ${
              filtroCapa === tab.id
                ? "border-cyan-400 bg-cyan-950/80 text-white"
                : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* LISTA SCROLLABLE DE REGISTROS DE TELEMETRÍA CON ETIQUETAS [MEDIDO], [DERIVADO], [SIMULADO] */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {(filtroCapa === "TODAS" || filtroCapa === "movilidadTerreno") &&
          nodo.capas.movilidadTerreno.map((reg) => (
            <TarjetaDatoTrazable key={reg.id} registro={reg} />
          ))}

        {(filtroCapa === "TODAS" || filtroCapa === "seguridadSupervivencia") &&
          nodo.capas.seguridadSupervivencia.map((reg) => (
            <TarjetaDatoTrazable key={reg.id} registro={reg} />
          ))}

        {(filtroCapa === "TODAS" || filtroCapa === "interesCientifico") &&
          nodo.capas.interesCientifico.map((reg) => (
            <TarjetaDatoTrazable key={reg.id} registro={reg} />
          ))}
      </div>
    </div>
  );
}
