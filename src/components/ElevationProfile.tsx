"use client";

import React from "react";
import type { WaypointNode } from "~/types/mission";

interface ElevationProfileProps {
  nodos: WaypointNode[];
  nodoSeleccionadoId: string;
  onSelectNodo: (id: string) => void;
  etapaActual: number;
  includeDetour: boolean;
}

export function ElevationProfile({
  nodos,
  nodoSeleccionadoId,
  onSelectNodo,
  etapaActual,
  includeDetour,
}: ElevationProfileProps) {
  const nodo1 = nodos.find((n) => n.orden === 1);
  const nodo2 = nodos.find((n) => n.orden === 2);
  const nodo3 = nodos.find((n) => n.orden === 3);
  const nodo4 = nodos.find((n) => n.orden === 4);

  if (!nodo1 || !nodo2 || !nodo3 || !nodo4) return null;

  // Posiciones normalizadas en el gráfico SVG (viewBox 0 0 600 105)
  // Elevaciones reales: N1=-3922m, N2=-3898m (pico pendiente >22°), N3=-3901m, N4=-3887m
  const pts = {
    n1: { x: 55, y: 78, node: nodo1 },
    n2: { x: 215, y: 26, node: nodo2 },
    n3: { x: 385, y: 48, node: nodo3 },
    n4: { x: 545, y: 20, node: nodo4 },
  };

  // Posición X/Y sincronizada con la etapa actual del Reproductor Secuencial
  const getStepMarker = () => {
    switch (etapaActual) {
      case 1:
        return { x: pts.n1.x, y: pts.n1.y, label: "ETAPA 1: SALIDA" };
      case 2:
        return {
          x: (pts.n1.x + pts.n3.x) / 2,
          y: (pts.n1.y + pts.n3.y) / 2 + 4,
          label: "ETAPA 2: RODEO <8°",
        };
      case 3:
        return { x: pts.n3.x, y: pts.n3.y, label: "ETAPA 3: CIENCIA 1" };
      case 4:
        return includeDetour
          ? { x: pts.n4.x, y: pts.n4.y, label: "ETAPA 4: DESVÍO N4" }
          : { x: pts.n3.x, y: pts.n3.y, label: "ETAPA 4: DECISIÓN" };
      case 5:
      default:
        return { x: pts.n1.x, y: pts.n1.y, label: "ETAPA 5: RETORNO" };
    }
  };

  const marker = getStepMarker();

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/95 px-3 py-2 font-mono">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
        <div className="flex items-center gap-2">
          <span className="font-extrabold uppercase tracking-wider text-cyan-300">
            PERFIL DE ELEVACIÓN Y PENDIENTE (MOLA / MARS TREK)
          </span>
          <span className="rounded bg-emerald-950/90 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-500/40">
            Corredor Seguro &lt;8° (6.4°–7.5°)
          </span>
          <span className="rounded bg-rose-950/90 px-1.5 py-0.5 text-[9px] font-bold text-rose-300 border border-rose-500/50">
            Pico Crítico &gt;22° (N2: 24.5° Excluido)
          </span>
        </div>
        <span className="text-amber-300 font-bold">
          Sincronizado: {marker.label}
        </span>
      </div>

      {/* Gráfica SVG del Perfil Topográfico */}
      <div className="relative mt-1 h-[84px] w-full">
        <svg
          viewBox="0 0 600 100"
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
        >
          <defs>
            <linearGradient id="safeCorridorFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="dangerPeakFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Líneas guía horizontales de cota MOLA */}
          <line
            x1="15"
            y1="22"
            x2="585"
            y2="22"
            stroke="#334155"
            strokeWidth="0.7"
            strokeDasharray="3 3"
          />
          <line
            x1="15"
            y1="50"
            x2="585"
            y2="50"
            stroke="#334155"
            strokeWidth="0.7"
            strokeDasharray="3 3"
          />
          <line
            x1="15"
            y1="78"
            x2="585"
            y2="78"
            stroke="#334155"
            strokeWidth="0.7"
            strokeDasharray="3 3"
          />

          {/* Área de Pico Crítico >22° (Nodo 2 Excluido) */}
          <polygon
            points={`${pts.n1.x},${pts.n1.y} ${pts.n2.x},${pts.n2.y} ${pts.n3.x},${pts.n3.y} ${pts.n3.x},92 ${pts.n1.x},92`}
            fill="url(#dangerPeakFill)"
          />
          <polyline
            points={`${pts.n1.x},${pts.n1.y} ${pts.n2.x},${pts.n2.y} ${pts.n3.x},${pts.n3.y}`}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="1.8"
            strokeDasharray="4 3"
          />
          <text
            x={pts.n2.x}
            y={pts.n2.y - 9}
            textAnchor="middle"
            fill="#fda4af"
            fontSize="9.5"
            fontWeight="bold"
          >
            ⚠ PICO N2: 24.5° (&gt;22° EXCLUIDO)
          </text>

          {/* Área y Polilínea del Corredor Histórico Seguro (<8°: 6.4° -> 7.5°) */}
          <polygon
            points={`${pts.n1.x},${pts.n1.y} 220,66 ${pts.n3.x},${pts.n3.y} ${pts.n3.x},92 ${pts.n1.x},92`}
            fill="url(#safeCorridorFill)"
          />
          <path
            d={`M ${pts.n1.x} ${pts.n1.y} Q 220 68 ${pts.n3.x} ${pts.n3.y}`}
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2.6"
          />
          <text
            x="235"
            y="74"
            textAnchor="middle"
            fill="#67e8f9"
            fontSize="9.5"
            fontWeight="bold"
          >
            Corredor Seguro (&lt;8°: 6.4° → 7.5°)
          </text>

          {/* Tramo de Desvío Simulado (Nodo 3 -> Nodo 4: 11.8°) */}
          <line
            x1={pts.n3.x}
            y1={pts.n3.y}
            x2={pts.n4.x}
            y2={pts.n4.y}
            stroke={includeDetour ? "#fbbf24" : "#64748b"}
            strokeWidth={includeDetour ? "2.4" : "1.5"}
            strokeDasharray="5 3"
          />
          <text
            x={(pts.n3.x + pts.n4.x) / 2}
            y="29"
            textAnchor="middle"
            fill={includeDetour ? "#fde68a" : "#94a3b8"}
            fontSize="9"
            fontWeight="bold"
          >
            Desvío 11.8° [Simulado]
          </text>

          {/* Indicador sincronizado con la Etapa EVA actual */}
          <circle
            cx={marker.x}
            cy={marker.y}
            r="7.5"
            fill="none"
            stroke="#fde047"
            strokeWidth="2"
          />

          {/* Nodos interactivos en el perfil */}
          {([pts.n1, pts.n2, pts.n3, pts.n4] as const).map((item) => {
            const seleccionado = item.node.id === nodoSeleccionadoId;
            const esPeligro = item.node.riesgoTramo.pendienteGrados > 22;
            return (
              <g
                key={item.node.id}
                onClick={() => onSelectNodo(item.node.id)}
                className="cursor-pointer"
              >
                <circle
                  cx={item.x}
                  cy={item.y}
                  r={seleccionado ? "5.5" : "4.2"}
                  fill={
                    esPeligro
                      ? "#f43f5e"
                      : !item.node.esRutaHistoricaCuriosity
                      ? "#fbbf24"
                      : "#22d3ee"
                  }
                  stroke="#ffffff"
                  strokeWidth={seleccionado ? "2" : "1"}
                />
                <text
                  x={item.x}
                  y={item.y + 15}
                  textAnchor="middle"
                  fill={seleccionado ? "#ffffff" : "#cbd5e1"}
                  fontSize="9.5"
                  fontWeight="bold"
                >
                  N{item.node.orden}: {item.node.coordenadasMapa.elevacionM}m (
                  {item.node.riesgoTramo.pendienteGrados}°)
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
