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
  const todosLosRegistros = [
    ...nodo.capas.movilidadTerreno,
    ...nodo.capas.seguridadSupervivencia,
    ...nodo.capas.interesCientifico,
  ];
  const encontrarRegistro = (patron: RegExp) =>
    todosLosRegistros.find((registro) => patron.test(registro.nombre));
  const indicadores = [
    { titulo: "Temperatura diurna del aire", registro: encontrarRegistro(/temperatura/i) },
    { titulo: "Presión barométrica", registro: encontrarRegistro(/presión/i) },
    { titulo: "Radiación cósmica (GCR)", registro: encontrarRegistro(/radiación|dosis/i) },
    { titulo: "Contexto científico", registro: encontrarRegistro(/contexto|química|morfología/i) },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto">
      {/* CABECERA DE AUDITORÍA DEL NODO Y SELECTOR RÁPIDO CON GUANTES */}
      <div className="rounded-2xl border border-[#9b633f] bg-[#87502f] p-3 font-mono text-white">
        <div className="flex flex-wrap items-center justify-between gap-1.5 font-mono">
          <span className="rounded-lg bg-[#4f2b1b] px-3 py-2 text-xs font-medium">
            Nodo N{nodo.orden} · {nodo.imagenPov.codigoPia}
          </span>
          <span
            className={`rounded-lg bg-[#4f2b1b] px-3 py-2 text-[10px] font-medium ${
              nodo.esRutaHistoricaCuriosity
                ? "text-emerald-200"
                : "text-amber-200"
            }`}
          >
            {nodo.esRutaHistoricaCuriosity
              ? "RUTA HISTÓRICA CURIOSITY"
              : "DESVÍO SIMULADO (SOBRE MAPA REAL)"}
          </span>
        </div>

        <h2 className="mt-2 font-mono text-sm font-bold sm:text-base">
          {nodo.nombre}
        </h2>

      {/* Fotografía del punto con datos de cámara y pendiente */}
      <div className="relative mt-3 h-44 w-full shrink-0 overflow-hidden rounded-xl border border-[#6c3d27] bg-[#1a110e]">
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
      </div>

      <div className="grid grid-cols-4 gap-2 font-mono">
        {nodos.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => onSelectNodo(n.id)}
            aria-pressed={n.id === nodo.id}
            className={`min-h-10 rounded-xl border px-2 py-2 text-xs transition-colors ${
              n.id === nodo.id
                ? "border-cyan-400 bg-cyan-400 text-slate-950"
                : "border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-600"
            }`}
          >
            N{n.orden}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {indicadores.map(({ titulo, registro }) => (
          <section
            key={titulo}
            className="min-h-[105px] rounded-2xl border border-slate-800 bg-slate-900 p-3 font-mono"
          >
            <p className="text-[10px] uppercase tracking-wider text-slate-400">
              {titulo}
            </p>
            <p className="mt-2 text-lg font-bold text-slate-100">
              {!registro || registro.valor === null
                ? "Sin cobertura"
                : `${registro.valor}${registro.unidad ? ` ${registro.unidad}` : ""}`}
            </p>
            <p className="mt-1 truncate text-[10px] text-slate-500">
              {registro
                ? `${registro.clasificacion} · ${registro.instrumento}`
                : "Sin medición para este nodo"}
            </p>
          </section>
        ))}
      </div>

      <details className="rounded-2xl border border-slate-800 bg-slate-900 p-3 font-mono">
        <summary className="cursor-pointer list-none text-sm font-medium text-cyan-300">
          Ver telemetría y trazabilidad del nodo ({todosLosRegistros.length})
        </summary>
        <div className="mt-3 grid grid-cols-2 gap-1 font-mono text-[10px] xl:grid-cols-4">
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

        <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
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
      </details>
    </div>
  );
}
