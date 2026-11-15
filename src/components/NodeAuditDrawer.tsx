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

  return (
    <div className="flex h-full flex-col justify-between gap-2 overflow-hidden">
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
        <div className="mt-1.5 grid grid-cols-4 gap-1.5 font-mono">
          {nodos.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => onSelectNodo(n.id)}
              className={`min-h-[36px] rounded-lg border text-xs font-extrabold transition-all active:scale-95 ${
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

      {/* VISOR POV EN PRIMERA PERSONA DE CURIOSITY CON GALERÍA DE IMÁGENES REALES */}
      <div className="flex flex-col gap-1.5">
        <div className="relative h-52 w-full shrink-0 overflow-hidden rounded-xl border-2 border-cyan-500/50 bg-black shadow-lg">
          {/* Fallback SVG solo si la imagen aún no cargó */}
          {!imagenRealDisponible && (
            <svg
              viewBox="0 0 400 180"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
            >
              <rect width="400" height="180" fill="#2c1d19" />
              <polygon
                points="0,115 65,82 145,98 235,68 325,88 400,72 400,180 0,180"
                fill="#4a2819"
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
                  className={`rounded border px-2 py-0.5 font-black backdrop-blur-sm ${
                    esPeligroAlto
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
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 font-mono">
          {galeriaNodo.map((item, idx) => (
            <button
              key={item.src}
              type="button"
              onClick={() => {
                setIndiceFotoGaleria(idx);
                setImagenRealDisponible(true);
              }}
              className={`group relative h-11 overflow-hidden rounded-lg border-2 transition-all ${
                indiceFotoGaleria === idx
                  ? "border-cyan-400 ring-2 ring-cyan-400/40"
                  : "border-slate-700 opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={item.src}
                alt={item.etiqueta}
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-0 inset-x-0 bg-slate-950/85 px-1 py-0.2 text-[8px] font-bold text-slate-200 truncate">
                Foto {idx + 1}: {item.camaraSol}
              </span>
            </button>
          ))}
        </div>
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

      {/* LISTA SCROLLABLE DE REGISTROS DE TELEMETRÍA */}
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

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {galeriaNodo.map((item, idx) => (
                <button
                  key={item.src}
                  type="button"
                  onClick={() => setIndiceFotoGaleria(idx)}
                  className={`flex items-center gap-2 rounded-xl border p-1.5 text-left text-xs ${
                    indiceFotoGaleria === idx
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
