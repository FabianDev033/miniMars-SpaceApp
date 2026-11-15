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

/**
 * Galería curada con las fotos reales de NASA/Curiosity que están en /public/imagenes
 * asociadas a cada uno de los 4 nodos del recorrido en Mount Sharp.
 */
const GALERIA_POR_NODO: Record<
  string,
  Array<{ src: string; etiqueta: string; camaraSol: string }>
> = {
  "nodo-1-inicio-seguro": [
    {
      src: "/imagenes/1_inicio_ruta_PIA26552.jpg",
      etiqueta: "PIA26552 — Panorama Mount Sharp",
      camaraSol: "Mastcam • Sol 4476",
    },
    {
      src: "/imagenes/_mars.nasa.gov_msl-raw-images_proj_msl_redops_ods_surface_sol_04744_opgs_edr_fcam_FRB_818634586EDR_F1200232FHAZ00337M_.JPG",
      etiqueta: "Front Hazcam — Corredor de Entrada",
      camaraSol: "FHAZ • Sol 4744",
    },
    {
      src: "/imagenes/_mars.nasa.gov_msl-raw-images_proj_msl_redops_ods_surface_sol_04744_opgs_edr_ncam_NRB_818631220EDR_S1200232NCAM00594M_.JPG",
      etiqueta: "Navcam — Vista de Ascenso",
      camaraSol: "NCAM • Sol 4744",
    },
  ],
  "nodo-2-obstaculo-riesgo-alto": [
    {
      src: "/imagenes/2_alerta_obstaculo_PIA26364.jpg",
      etiqueta: "PIA26364 — Talud y Bloques Angulares (>22°)",
      camaraSol: "Mastcam • Sol 4189",
    },
    {
      src: "/imagenes/_mars.nasa.gov_msl-raw-images_proj_msl_redops_ods_surface_sol_04747_opgs_edr_ncam_NLB_818900417EDR_S1200232NCAM00593M_.JPG",
      etiqueta: "Navcam — Borde Escarpado",
      camaraSol: "NCAM • Sol 4747",
    },
    {
      src: "/imagenes/_mars.nasa.gov_msl-raw-images_proj_msl_redops_ods_surface_sol_04748_opgs_edr_ncam_NRB_818996184EDR_S1200346NCAM00273M_.JPG",
      etiqueta: "Navcam — Rocas Fracturadas",
      camaraSol: "NCAM • Sol 4748",
    },
  ],
  "nodo-3-ciencia-boxwork": [
    {
      src: "/imagenes/3_ciencia_boxwork_PIA26558.jpg",
      etiqueta: "Crestas Poligonales Boxwork (Vista Principal)",
      camaraSol: "NCAM/Mastcam • Sol 4750",
    },
    {
      src: "/imagenes/_mars.nasa.gov_msl-raw-images_proj_msl_redops_ods_surface_sol_04748_opgs_edr_ncam_NLB_818993153EDR_D1200232TRAV01462M_.JPG",
      etiqueta: "Red de Fracturas Cementadas Boxwork",
      camaraSol: "NCAM • Sol 4748",
    },
    {
      src: "/imagenes/_mars.nasa.gov_msl-raw-images_proj_msl_redops_ods_surface_sol_04750_opgs_edr_ncam_NRB_819166730EDR_M1200346NCAM00579M_.JPG",
      etiqueta: "Afloramiento de Nervaduras Minerales",
      camaraSol: "NCAM • Sol 4750",
    },
    {
      src: "/imagenes/_mars.nasa.gov_msl-raw-images_proj_msl_redops_ods_surface_sol_04750_opgs_edr_ncam_NLB_819166412EDR_S1200346NCAM00593M_.JPG",
      etiqueta: "Valle y Crestas en Mount Sharp",
      camaraSol: "NCAM • Sol 4750",
    },
  ],
  "nodo-4-desvio-nodulos": [
    {
      src: "/imagenes/4_muestreo_nodulos_PIA26697.jpg",
      etiqueta: "Textura Nodular y Fracturas (Desvío)",
      camaraSol: "NCAM/MAHLI • Sol 4527",
    },
    {
      src: "/imagenes/_mars.nasa.gov_msl-raw-images_proj_msl_redops_ods_surface_sol_04527_opgs_edr_ncam_NRB_799384323EDR_D1152106TRAV01397M_.JPG",
      etiqueta: "Detalle de Bloques con Nódulos",
      camaraSol: "NCAM • Sol 4527",
    },
    {
      src: "/imagenes/_mars.nasa.gov_msl-raw-images_proj_msl_redops_ods_surface_sol_04527_opgs_edr_ncam_NRB_799385581EDR_D1152226TRAV01397M_.JPG",
      etiqueta: "Superficie Evaporítica en Terraza",
      camaraSol: "NCAM • Sol 4527",
    },
  ],
};

export function NodeAuditDrawer({
  nodo,
  nodos,
  onSelectNodo,
}: NodeAuditDrawerProps) {
  const [visorCascoHudActivo, setVisorCascoHudActivo] = useState(true);
  const [filtroCapa, setFiltroCapa] = useState<FiltroCapaNodo>("TODAS");
  const [imagenRealDisponible, setImagenRealDisponible] = useState(true);
  const [indiceFotoGaleria, setIndiceFotoGaleria] = useState(0);
  const [lightboxAbierto, setLightboxAbierto] = useState(false);

  const galeriaNodo = GALERIA_POR_NODO[nodo.id] ?? [
    {
      src: nodo.imagenPov.archivoLocal,
      etiqueta: nodo.imagenPov.titulo,
      camaraSol: `${nodo.imagenPov.camara} • ${nodo.imagenPov.sol}`,
    },
  ];

  const fotoActiva = galeriaNodo[indiceFotoGaleria] ?? galeriaNodo[0]!;

  useEffect(() => {
    setIndiceFotoGaleria(0);
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
      {/* CABECERA DE AUDITORÍA DEL NODO Y VISOR POV CON GALERÍA DE IMÁGENES REALES */}
      <div className="rounded-2xl border border-[#9b633f] bg-[#87502f] p-3 font-mono text-white">
        <div className="flex flex-wrap items-center justify-between gap-1.5 font-mono">
          <span className="rounded-lg bg-[#4f2b1b] px-3 py-2 text-xs font-medium">
            Nodo N{nodo.orden} · {nodo.imagenPov.codigoPia}
          </span>
          <span
            className={`rounded-lg bg-[#4f2b1b] px-3 py-2 text-[10px] font-medium ${nodo.esRutaHistoricaCuriosity
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

        {/* Fotografía del punto con datos de cámara, pendiente y galería multi-cámara */}
        <div className="mt-3 flex flex-col gap-1.5">
          <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-xl border border-[#6c3d27] bg-[#1a110e]">
            {/* Fallback visual marciano de alta fidelidad si la imagen local aún no está en /public/imagenes */}
            {!imagenRealDisponible && (
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
            )}

            {imagenRealDisponible && (
              <img
                key={fotoActiva.src}
                src={fotoActiva.src}
                alt={fotoActiva.etiqueta}
                onError={() => setImagenRealDisponible(false)}
                onClick={() => setLightboxAbierto(true)}
                className="absolute inset-0 h-full w-full cursor-zoom-in object-cover transition-transform duration-300 hover:scale-105"
              />
            )}

            {/* Superposición opcional tipo "Visor de Casco (HUD)" ligera para no tapar la foto */}
            {visorCascoHudActivo && (
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-2 font-mono">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="rounded border border-cyan-400/70 bg-slate-950/80 px-2 py-0.5 font-bold text-cyan-300 backdrop-blur-sm">
                    {fotoActiva.camaraSol}
                  </span>
                  <span
                    className={`rounded border px-2 py-0.5 font-black backdrop-blur-sm ${esPeligroAlto
                        ? "border-rose-400 bg-rose-950/85 text-rose-200"
                        : "border-emerald-400/70 bg-emerald-950/80 text-emerald-300"
                      }`}
                  >
                    PENDIENTE: {nodo.riesgoTramo.pendienteGrados}° (
                    {nodo.riesgoTramo.nivel.toUpperCase()})
                  </span>
                </div>

                <div className="rounded-lg border border-slate-700/80 bg-slate-950/80 px-2.5 py-1 text-[10px] text-slate-200 backdrop-blur-sm">
                  <p className="font-bold text-cyan-200">{fotoActiva.etiqueta}</p>
                  <p className="line-clamp-1 text-slate-300">
                    {nodo.imagenPov.descripcionHud}
                  </p>
                </div>
              </div>
            )}

            {/* Botones de control sobre la imagen: Ampliar y HUD ON/OFF */}
            <div className="absolute right-2 top-8 z-10 flex items-center gap-1.5 font-mono">
              <button
                type="button"
                onClick={() => setLightboxAbierto(true)}
                className="rounded-lg border border-amber-400/80 bg-slate-950/90 px-2 py-1 text-[10px] font-black text-amber-300 hover:bg-slate-800"
              >
                [🔍 Ampliar Foto]
              </button>
              <button
                type="button"
                onClick={() => setVisorCascoHudActivo(!visorCascoHudActivo)}
                className="rounded-lg border border-cyan-400/60 bg-slate-950/90 px-2 py-1 text-[10px] font-bold text-cyan-200 hover:bg-slate-800"
              >
                {visorCascoHudActivo ? "HUD: ON" : "HUD: OFF"}
              </button>
            </div>
          </div>

          {/* Tira de miniaturas para cambiar entre las fotos reales de Curiosity de este nodo */}
          <div className="grid grid-cols-3 gap-1.5 font-mono sm:grid-cols-4">
            {galeriaNodo.map((item, idx) => (
              <button
                key={item.src}
                type="button"
                onClick={() => {
                  setIndiceFotoGaleria(idx);
                  setImagenRealDisponible(true);
                }}
                className={`group relative h-11 overflow-hidden rounded-lg border-2 transition-all ${indiceFotoGaleria === idx
                    ? "border-cyan-400 ring-2 ring-cyan-400/40"
                    : "border-[#6c3d27] opacity-75 hover:opacity-100"
                  }`}
              >
                <img
                  src={item.src}
                  alt={item.etiqueta}
                  className="h-full w-full object-cover"
                />
                <span className="absolute inset-x-0 bottom-0 truncate bg-slate-950/85 px-1 py-0.5 text-[8px] font-bold text-slate-200">
                  Foto {idx + 1}: {item.camaraSol}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 font-mono">
        {nodos.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => onSelectNodo(n.id)}
            aria-pressed={n.id === nodo.id}
            className={`min-h-10 rounded-xl border px-2 py-2 text-xs transition-colors ${n.id === nodo.id
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
              className={`rounded-lg border py-1.5 font-extrabold transition-all ${filtroCapa === tab.id
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

      {/* MODAL LIGHTBOX DE PANTALLA COMPLETA PARA INSPECCIONAR LAS FOTOGRAFÍAS DE CURIOSITY */}
      {lightboxAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md"
          onClick={() => setLightboxAbierto(false)}
        >
          <div
            className="flex max-h-[92vh] w-full max-w-5xl flex-col gap-3 rounded-2xl border-2 border-cyan-400 bg-slate-950 p-4 font-mono shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div>
                <span className="text-xs font-black text-cyan-300">
                  {nodo.nombre} // {fotoActiva.camaraSol}
                </span>
                <h3 className="text-sm font-bold text-white">
                  {fotoActiva.etiqueta}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLightboxAbierto(false)}
                className="rounded-xl border border-rose-500 bg-rose-950/70 px-3 py-1.5 text-xs font-black text-rose-200 hover:bg-rose-900"
              >
                [✕ Cerrar Vista Ampliada]
              </button>
            </div>

            <div className="relative flex max-h-[68vh] items-center justify-center overflow-hidden rounded-xl bg-black">
              <img
                src={fotoActiva.src}
                alt={fotoActiva.etiqueta}
                className="max-h-[68vh] w-auto object-contain"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {galeriaNodo.map((item, idx) => (
                <button
                  key={item.src}
                  type="button"
                  onClick={() => setIndiceFotoGaleria(idx)}
                  className={`flex items-center gap-2 rounded-xl border p-1.5 text-left text-xs ${indiceFotoGaleria === idx
                      ? "border-cyan-400 bg-cyan-950/60 text-white"
                      : "border-slate-800 bg-slate-900 text-slate-400"
                    }`}
                >
                  <img
                    src={item.src}
                    alt={item.etiqueta}
                    className="h-10 w-14 shrink-0 rounded object-cover"
                  />
                  <div className="truncate">
                    <div className="font-bold text-cyan-300">
                      {item.camaraSol}
                    </div>
                    <div className="truncate text-[10px]">{item.etiqueta}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
