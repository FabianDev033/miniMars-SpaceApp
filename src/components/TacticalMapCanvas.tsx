"use client";

import React, { useState } from "react";
import type { MissionSimulationResult, WaypointNode } from "~/types/mission";

interface TacticalMapCanvasProps {
  nodos: WaypointNode[];
  nodoSeleccionadoId: string;
  onSelectNodo: (id: string) => void;
  includeDetour: boolean;
  simulation: MissionSimulationResult;
}

export function TacticalMapCanvas({
  nodos,
  nodoSeleccionadoId,
  onSelectNodo,
  includeDetour,
  simulation,
}: TacticalMapCanvasProps) {
  // Controles de encendido y opacidad de las 3 capas cartográficas (4.1, 4.2, 4.3)
  const [capa41Activa, setCapa41Activa] = useState(true);
  const [opacidad41, setOpacidad41] = useState(90);

  const [capa42Activa, setCapa42Activa] = useState(true);
  const [opacidad42, setOpacidad42] = useState(95);

  const [capa43Activa, setCapa43Activa] = useState(true);
  const [opacidad43, setOpacidad43] = useState(70);

  // Detección de imágenes PNG opcionales en /public/imagenes con fallback SVG/CSS inmediato
  const [opticoCargado, setOpticoCargado] = useState(true);
  const [molaCargado, setMolaCargado] = useState(true);
  const [termicaCargado, setTermicaCargado] = useState(true);

  const nodo1 = nodos.find((n) => n.orden === 1);
  const nodo2 = nodos.find((n) => n.orden === 2);
  const nodo3 = nodos.find((n) => n.orden === 3);
  const nodo4 = nodos.find((n) => n.orden === 4);

  // Radio del anillo de Límite de Regreso Seguro (Walk-Back Limit) según si perfora reserva
  const walkBackRadius = simulation.oxigeno.perforaReserva25 ? 52 : 76;

  return (
    <div className="flex h-full flex-col justify-between gap-2">
      {/* BARRA DE CONTROL DE CAPAS (ENCENDER/APAGAR + OPACIDAD) APTA PARA GUANTES */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {/* Control Capa 4.1: Movilidad y Terreno */}
        <div
          className={`flex flex-col justify-between rounded-xl border-2 px-3 py-2 font-mono transition-all ${
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
              Capa 4.1: Terreno / MOLA
            </button>
            <span className="text-[11px] font-bold text-slate-300">
              {capa41Activa ? `${opacidad41}%` : "OFF"}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-[10px] text-slate-400">Opacidad</span>
            <input
              type="range"
              min={15}
              max={100}
              value={opacidad41}
              disabled={!capa41Activa}
              onChange={(e) => setOpacidad41(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-cyan-400"
            />
          </div>
        </div>

        {/* Control Capa 4.2: Seguridad (RAD / REMS Puntual) */}
        <div
          className={`flex flex-col justify-between rounded-xl border-2 px-3 py-2 font-mono transition-all ${
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
              Capa 4.2: Seguridad (RAD/REMS)
            </button>
            <span className="text-[11px] font-bold text-slate-300">
              {capa42Activa ? `${opacidad42}%` : "OFF"}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-[10px] text-slate-400">Opacidad</span>
            <input
              type="range"
              min={20}
              max={100}
              value={opacidad42}
              disabled={!capa42Activa}
              onChange={(e) => setOpacidad42(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-emerald-400"
            />
          </div>
        </div>

        {/* Control Capa 4.3: Interés Científico (Geológica / Térmica) */}
        <div
          className={`flex flex-col justify-between rounded-xl border-2 px-3 py-2 font-mono transition-all ${
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
              Capa 4.3: Geología / Térmica
            </button>
            <span className="text-[11px] font-bold text-slate-300">
              {capa43Activa ? `${opacidad43}%` : "OFF"}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-[10px] text-slate-400">Opacidad</span>
            <input
              type="range"
              min={15}
              max={100}
              value={opacidad43}
              disabled={!capa43Activa}
              onChange={(e) => setOpacidad43(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-amber-400"
            />
          </div>
        </div>
      </div>

      {/* LIENZO CENTRAL DEL MAPA SUPERPUESTO */}
      <div className="relative min-h-[300px] flex-1 overflow-hidden rounded-2xl border-2 border-slate-700/90 bg-[#120d10] shadow-inner">
        {/* 1. CAPA 4.1: IMAGEN BASE ÓPTICA + SUPERPOSICIÓN MOLA (CON FALLBACK SVG/CSS AUTOMÁTICO) */}
        {capa41Activa && (
          <div
            className="absolute inset-0 transition-opacity duration-200"
            style={{ opacity: opacidad41 / 100 }}
          >
            {/* Fallback estilizado de superficie marciana e hipsometría MOLA siempre presente debajo */}
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
            >
              <defs>
                <linearGradient id="molaBase" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1e1b2e" />
                  <stop offset="40%" stopColor="#3b2416" />
                  <stop offset="75%" stopColor="#5c2d16" />
                  <stop offset="100%" stopColor="#7c3a1d" />
                </linearGradient>
                <pattern
                  id="coordGrid"
                  width="10"
                  height="10"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 10 0 L 0 0 0 10"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="0.12"
                    strokeOpacity="0.28"
                  />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#molaBase)" />
              <rect width="100" height="100" fill="url(#coordGrid)" />

              {/* Curvas de nivel topográficas MOLA / HiRISE */}
              <path
                d="M 0 90 Q 30 78 100 70"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="0.28"
                strokeDasharray="1.5 1"
                strokeOpacity="0.65"
              />
              <path
                d="M 0 74 Q 42 60 100 52"
                fill="none"
                stroke="#34d399"
                strokeWidth="0.28"
                strokeDasharray="1.5 1"
                strokeOpacity="0.65"
              />
              <path
                d="M 0 54 Q 48 40 100 30"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="0.32"
                strokeDasharray="1.5 1"
                strokeOpacity="0.7"
              />
              <path
                d="M 0 36 Q 45 22 100 12"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="0.38"
                strokeDasharray="1 1"
                strokeOpacity="0.8"
              />
            </svg>

            {/* Intentar cargar /imagenes/mapa_base_optico.png y /imagenes/capa_topografia_mola.png si existen */}
            {opticoCargado && (
              <img
                src="/imagenes/mapa_base_optico.png"
                alt="Mapa Base Óptico Mount Sharp"
                onError={() => setOpticoCargado(false)}
                className="absolute inset-0 h-full w-full object-cover mix-blend-lighten opacity-80"
              />
            )}
            {molaCargado && (
              <img
                src="/imagenes/capa_topografia_mola.png"
                alt="Superposición Topográfica MOLA"
                onError={() => setMolaCargado(false)}
                className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-70"
              />
            )}
          </div>
        )}

        {/* 2. CAPA 4.3: SUPERPOSICIÓN GEOLÓGICA / TÉRMICA DE RETÍCULA BOXWORK */}
        {capa43Activa && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-200"
            style={{ opacity: opacidad43 / 100 }}
          >
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
            >
              <defs>
                <pattern
                  id="boxworkFractureNet"
                  width="14"
                  height="14"
                  patternUnits="userSpaceOnUse"
                >
                  <polygon
                    points="7,0 14,5 11,14 3,14 0,5"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="0.32"
                    strokeOpacity="0.55"
                  />
                </pattern>
                <radialGradient id="thermalHotspot" cx="62%" cy="55%" r="36%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.32" />
                  <stop offset="55%" stopColor="#06b6d4" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="100" height="100" fill="url(#boxworkFractureNet)" />
              <rect width="100" height="100" fill="url(#thermalHotspot)" />
            </svg>

            {termicaCargado && (
              <img
                src="/imagenes/capa_termica_geologica.png"
                alt="Superposición Geológica y Térmica Boxwork"
                onError={() => setTermicaCargado(false)}
                className="absolute inset-0 h-full w-full object-cover mix-blend-screen opacity-75"
              />
            )}
          </div>
        )}

        {/* 3. CAPA SVG TÁCTICA: WALK-BACK LIMIT, ZONA EXCLUSIÓN NODO 2, RUTA HISTÓRICA Y DESVÍO */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          {/* Anillo visual del Límite de Regreso Seguro (Walk-Back Limit) centrado en Nodo 1 */}
          {nodo1 && (
            <g>
              <circle
                cx={nodo1.coordenadasMapa.xPercent}
                cy={nodo1.coordenadasMapa.yPercent}
                r={walkBackRadius}
                fill="none"
                stroke={
                  simulation.oxigeno.perforaReserva25 ? "#f43f5e" : "#10b981"
                }
                strokeWidth="0.55"
                strokeDasharray="2.5 1.5"
                strokeOpacity="0.85"
              />
              <text
                x={Math.min(72, nodo1.coordenadasMapa.xPercent + 18)}
                y={Math.max(12, nodo1.coordenadasMapa.yPercent - 38)}
                fill={
                  simulation.oxigeno.perforaReserva25 ? "#fda4af" : "#6ee7b7"
                }
                fontSize="2.5"
                fontFamily="monospace"
                fontWeight="bold"
              >
                ANILLO LÍMITE DE REGRESO SEGURO (WALK-BACK LIMIT 25% O2)
              </text>
            </g>
          )}

          {/* Zona de Exclusión en Rojo sobre el Nodo 2 (Pendiente >22°) */}
          {nodo2 && (
            <g>
              <circle
                cx={nodo2.coordenadasMapa.xPercent}
                cy={nodo2.coordenadasMapa.yPercent}
                r="12"
                fill="rgba(244, 63, 94, 0.22)"
                stroke="#f43f5e"
                strokeWidth="0.7"
                strokeDasharray="1.5 1"
              />
              {nodo1 && (
                <line
                  x1={nodo1.coordenadasMapa.xPercent}
                  y1={nodo1.coordenadasMapa.yPercent}
                  x2={nodo2.coordenadasMapa.xPercent}
                  y2={nodo2.coordenadasMapa.yPercent}
                  stroke="#f43f5e"
                  strokeWidth="0.8"
                  strokeDasharray="1.2 1.2"
                />
              )}
              <text
                x={nodo2.coordenadasMapa.xPercent - 14}
                y={nodo2.coordenadasMapa.yPercent - 13.5}
                fill="#fda4af"
                fontSize="2.5"
                fontFamily="monospace"
                fontWeight="bold"
              >
                ZONA DE EXCLUSIÓN (&gt;22° / ROCAS ANGULARES)
              </text>
            </g>
          )}

          {/* Trayecto Histórico Real de Curiosity en Línea Sólida (Verde/Cian) Nodo 1 -> Nodo 3 */}
          {nodo1 && nodo3 && (
            <g>
              <path
                d={`M ${nodo1.coordenadasMapa.xPercent} ${nodo1.coordenadasMapa.yPercent} Q 38 72 ${nodo3.coordenadasMapa.xPercent} ${nodo3.coordenadasMapa.yPercent}`}
                fill="none"
                stroke="#22d3ee"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <text
                x="28"
                y="72"
                fill="#67e8f9"
                fontSize="2.5"
                fontFamily="monospace"
                fontWeight="bold"
              >
                RUTA HISTÓRICA CURIOSITY (MEDIDA)
              </text>
            </g>
          )}

          {/* Desvío Simulado hacia Parada Científica 2 (Nodo 4) en Línea Punteada */}
          {nodo3 && nodo4 && (
            <g>
              <line
                x1={nodo3.coordenadasMapa.xPercent}
                y1={nodo3.coordenadasMapa.yPercent}
                x2={nodo4.coordenadasMapa.xPercent}
                y2={nodo4.coordenadasMapa.yPercent}
                stroke={includeDetour ? "#fbbf24" : "#94a3b8"}
                strokeWidth={includeDetour ? "1.5" : "0.9"}
                strokeDasharray="2 1.5"
              />
              <text
                x="61"
                y="51"
                fill={includeDetour ? "#fde68a" : "#cbd5e1"}
                fontSize="2.5"
                fontFamily="monospace"
                fontWeight="bold"
              >
                RUTA SIMULADA (DESVÍO NODO 4)
              </text>
            </g>
          )}
        </svg>

        {/* HUD Superior del Mapa: Coordenadas y Leyenda de Trazado */}
        <div className="pointer-events-none absolute left-2.5 right-2.5 top-2.5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-700/80 bg-slate-950/85 px-3 py-1.5 font-mono text-[10px] backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 font-bold text-cyan-300">
              <span className="inline-block h-1.5 w-5 rounded bg-cyan-400" />
              Ruta Histórica Curiosity
            </span>
            <span className="flex items-center gap-1.5 font-bold text-amber-300">
              <span className="inline-block h-1.5 w-5 border border-dashed border-amber-400 bg-amber-400/20" />
              Ruta Simulada (Desvío PIA26697)
            </span>
            <span className="flex items-center gap-1.5 font-bold text-rose-300">
              <span className="inline-block h-2.5 w-2.5 rounded-full border border-rose-400 bg-rose-500/40" />
              Exclusión &gt;22°
            </span>
          </div>
          <span className="text-slate-400">
            CRÁTER GALE • 4.68°S 137.36°E • SIN EXTRAPOLACIÓN CONTINUA
          </span>
        </div>

        {/* 4. BOTONES INTERACTIVOS GRANDES SOBRE CADA UNO DE LOS 4 NODOS + INDICADORES PUNTUALES CAPA 4.2 */}
        {nodos.map((nodo) => {
          const esSeleccionado = nodo.id === nodoSeleccionadoId;
          const esObstaculo = nodo.tipo === "obstaculo_exclusion";
          const esDesvio = !nodo.esRutaHistoricaCuriosity;

          // Buscar lecturas puntuales de RAD y REMS para la Capa 4.2
          const radRecord = nodo.capas.seguridadSupervivencia.find((r) =>
            r.instrumento.includes("RAD")
          );
          const remsRecord = nodo.capas.seguridadSupervivencia.find((r) =>
            r.instrumento.includes("REMS")
          );

          return (
            <div
              key={nodo.id}
              style={{
                left: `${nodo.coordenadasMapa.xPercent}%`,
                top: `${nodo.coordenadasMapa.yPercent}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              <button
                type="button"
                onClick={() => onSelectNodo(nodo.id)}
                className="group flex flex-col items-center focus:outline-none"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full border-2 font-mono text-xs font-black transition-all active:scale-95 ${
                    esSeleccionado
                      ? "scale-125 border-white bg-cyan-500 text-slate-950 ring-4 ring-cyan-400/60"
                      : esObstaculo
                      ? "border-rose-400 bg-rose-950/95 text-rose-200 hover:scale-110"
                      : esDesvio
                      ? "border-amber-400 bg-amber-950/95 text-amber-200 hover:scale-110"
                      : "border-cyan-300 bg-slate-900/95 text-cyan-200 hover:scale-110"
                  }`}
                >
                  N{nodo.orden}
                </div>

                <div
                  className={`mt-1 whitespace-nowrap rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold shadow-lg ${
                    esSeleccionado
                      ? "border-cyan-300 bg-slate-950 text-cyan-200"
                      : esObstaculo
                      ? "border-rose-500/80 bg-rose-950/95 text-rose-200"
                      : "border-slate-700 bg-slate-950/90 text-slate-200"
                  }`}
                >
                  {nodo.imagenPov.codigoPia} • {nodo.riesgoTramo.pendienteGrados}°
                </div>
              </button>

              {/* Indicadores puntuales de Capa 4.2 (RAD / REMS) sobre el nodo */}
              {capa42Activa && (
                <div
                  style={{ opacity: opacidad42 / 100 }}
                  className="pointer-events-none mt-1 flex flex-col items-center gap-0.5 font-mono text-[9px]"
                >
                  <span
                    className={`rounded border px-1.5 py-0.5 font-bold ${
                      radRecord?.valor !== null && radRecord?.valor !== undefined
                        ? "border-emerald-500/60 bg-emerald-950/90 text-emerald-300"
                        : "border-slate-600 bg-slate-900/95 text-slate-400"
                    }`}
                  >
                    RAD:{" "}
                    {radRecord?.valor !== null && radRecord?.valor !== undefined
                      ? `${radRecord.valor} ${radRecord.unidad}`
                      : "Sin medición directa"}
                  </span>
                  {remsRecord && (
                    <span
                      className={`rounded border px-1.5 py-0.5 font-bold ${
                        remsRecord.valor !== null
                          ? "border-sky-500/60 bg-sky-950/90 text-sky-300"
                          : "border-slate-600 bg-slate-900/95 text-slate-400"
                      }`}
                    >
                      REMS:{" "}
                      {remsRecord.valor !== null
                        ? `${remsRecord.valor} ${remsRecord.unidad}`
                        : "Sin medición puntual"}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* PERFIL VISUAL DE PENDIENTE Y ELEVACIÓN DEL RECORRIDO (CAPA 4.1) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2 font-mono">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <span className="font-extrabold uppercase tracking-wider text-cyan-300">
            PERFIL TOPOGRÁFICO Y DE PENDIENTE DEL RECORRIDO (MOLA / HiRISE DEM):
          </span>
          <span className="text-slate-400">
            Límite operativo de pendiente EVA: ≤ 22.0°
          </span>
        </div>

        <div className="mt-1.5 grid grid-cols-4 gap-2">
          {nodos.map((n) => {
            const activo = n.id === nodoSeleccionadoId;
            const peligro = n.riesgoTramo.pendienteGrados > 22;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => onSelectNodo(n.id)}
                className={`flex flex-col justify-between rounded-lg border px-2.5 py-1.5 text-left transition-all ${
                  activo
                    ? "border-cyan-400 bg-cyan-950/50"
                    : peligro
                    ? "border-rose-500/60 bg-rose-950/25"
                    : "border-slate-800 bg-slate-950/70 hover:border-slate-600"
                }`}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-white">
                    N{n.orden} ({n.imagenPov.codigoPia})
                  </span>
                  <span
                    className={`rounded px-1 font-black ${
                      peligro
                        ? "bg-rose-500 text-white"
                        : n.riesgoTramo.nivel === "medio"
                        ? "bg-amber-500/30 text-amber-300"
                        : "bg-emerald-500/20 text-emerald-300"
                    }`}
                  >
                    {n.riesgoTramo.pendienteGrados}°
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Elev: {n.coordenadasMapa.elevacionM}m</span>
                  <span>
                    {n.esRutaHistoricaCuriosity ? "[Histórico]" : "[Simulado]"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
