"use client";

import React, { useState } from "react";
import type {
  DataOrigin,
  MissionSimulationParameters,
  TelemetryRecord,
  WaypointNode,
} from "~/types/mission";

interface ScientificAuditModalProps {
  abierto: boolean;
  onCerrar: () => void;
  nodos: WaypointNode[];
  parametros: MissionSimulationParameters;
}

type PestanaAuditoria = "MATRIZ" | "MODELO" | "FUENTES";

const BADGE_ORIGEN: Record<DataOrigin, string> = {
  medido: "border-emerald-500/70 bg-emerald-950/90 text-emerald-300",
  derivado: "border-sky-500/70 bg-sky-950/90 text-sky-300",
  simulado: "border-amber-500/70 bg-amber-950/90 text-amber-300",
};

export function ScientificAuditModal({
  abierto,
  onCerrar,
  nodos,
  parametros,
}: ScientificAuditModalProps) {
  const [pestana, setPestana] = useState<PestanaAuditoria>("MATRIZ");
  const [filtroOrigen, setFiltroOrigen] = useState<
    "TODOS" | DataOrigin | "NULOS"
  >("TODOS");

  if (!abierto) return null;

  // Construir automáticamente todas las filas desde el dataset local
  const todosLosRegistros: Array<{
    contextoNodo: string;
    capa: string;
    registro: TelemetryRecord;
  }> = [
    ...parametros.metadatosParametros.map((registro) => ({
      contextoNodo: "Parámetro Global EVA",
      capa: "5. Lógica Supervivencia",
      registro,
    })),
    ...nodos.flatMap((n) => [
      ...n.capas.movilidadTerreno.map((registro) => ({
        contextoNodo: `N${n.orden} (${n.imagenPov.codigoPia})`,
        capa: "4.1 Movilidad y Terreno",
        registro,
      })),
      ...n.capas.seguridadSupervivencia.map((registro) => ({
        contextoNodo: `N${n.orden} (${n.imagenPov.codigoPia})`,
        capa: "4.2 Seguridad y Supervivencia",
        registro,
      })),
      ...n.capas.interesCientifico.map((registro) => ({
        contextoNodo: `N${n.orden} (${n.imagenPov.codigoPia})`,
        capa: "4.3 Interés Científico",
        registro,
      })),
    ]),
  ];

  const registrosFiltrados = todosLosRegistros.filter((item) => {
    if (filtroOrigen === "TODOS") return true;
    if (filtroOrigen === "NULOS") return item.registro.valor === null;
    return item.registro.clasificacion === filtroOrigen;
  });

  const totalMedidos = todosLosRegistros.filter(
    (r) => r.registro.clasificacion === "medido"
  ).length;
  const totalDerivados = todosLosRegistros.filter(
    (r) => r.registro.clasificacion === "derivado"
  ).length;
  const totalSimulados = todosLosRegistros.filter(
    (r) => r.registro.clasificacion === "simulado"
  ).length;
  const totalNulos = todosLosRegistros.filter(
    (r) => r.registro.valor === null
  ).length;

  const fuentesOficiales = [
    {
      categoria: "Soporte Vital y Tasa Metabólica de O2",
      titulo:
        "NASA Life Support Baseline Values and Assumptions Document (BVAD 2022)",
      uso: "Referencia de magnitud para la tasa de uso de oxígeno (0.076 kg/h en sistema cerrado).",
      url: "https://ntrs.nasa.gov/api/citations/20210024855/downloads/BVAD_2.15.22-final.pdf",
    },
    {
      categoria: "Base Cartográfica, Mosaicos y Elevación MOLA / HiRISE",
      titulo: "NASA Mars Trek — Documentación de Capas y Herramientas",
      uso: "Mosaicos orbitales, cotas de elevación MOLA/HiRISE DEM y perfiles de pendiente en Mount Sharp.",
      url: "https://trek.nasa.gov/tiles/apidoc/trekAPI.html?body=mars",
    },
    {
      categoria: "Geometría Histórica de Recorrido de Curiosity",
      titulo: "NASA Mars Trek — Curiosity Path MapServer (Capa Polilínea)",
      uso: "Referencia de trazado real recorrido por el rover MSL Curiosity en el ascenso a Mount Sharp.",
      url: "https://trek.nasa.gov/mars/trekarcgis/rest/services/curiosity_path/MapServer/0",
    },
    {
      categoria: "Clima Marciano y Meteorología Puntual (REMS)",
      titulo: "PDS Atmospheres — Archivo REMS de Curiosity",
      uso: "Registros puntuales de presión barométrica (Pa), temperatura del aire/suelo (°C) y cobertura nula de viento.",
      url: "https://pdsatmospheres.nmsu.edu/data_and_services/atmospheres_data/MARS/curiosity/rems.html",
    },
    {
      categoria: "Radiación Superficial (RAD) e Instrumentos Geoquímicos MSL",
      titulo: "PDS Geosciences Node — Mars Science Laboratory (MSL) Archive",
      uso: "Dosis de radiación cósmica GCR (mSv/sol) del detector RAD y datos espectrométricos ChemCam/APXS.",
      url: "https://pds-geosciences.wustl.edu/missions/msl/",
    },
    {
      categoria: "Campaña de Exploración en el Terreno Boxwork",
      titulo:
        "NASA Science Blog — Curiosity Blog, Sols 4838–4844: Wrapping Up the Boxwork Terrain",
      uso: "Contexto de desplazamientos, crestas minerales poligonales y operaciones con instrumentos en el sector boxwork.",
      url: "https://science.nasa.gov/blog/curiosity-blog-sols-4838-4844-wrapping-up-the-boxwork-terrain/",
    },
    {
      categoria: "Catálogo Fotográfico en Primera Persona (POV Curiosity)",
      titulo:
        "NASA/JPL Photojournal & MSL Raw Images (PIA26552, PIA26364, PIA26558, PIA26697)",
      uso: "Fotografías reales de Mastcam y MAHLI vinculadas a cada uno de los 4 nodos del recorrido.",
      url: "https://mars.nasa.gov/msl/multimedia/raw-images/",
    },
    {
      categoria: "Contexto Geológico Regional Marciano",
      titulo: "USGS Scientific Investigations Map 3292 — Geologic Map of Mars",
      uso: "Marco estratigráfico regional del Cráter Gale y Aeolis Mons (Mount Sharp).",
      url: "https://pubs.usgs.gov/sim/3292/",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-3 sm:p-6 backdrop-blur-md">
      <div className="flex max-h-[92vh] w-full max-w-[1380px] flex-col justify-between overflow-hidden rounded-3xl border-2 border-cyan-400/80 bg-[#080d1a] p-4 sm:p-6 font-mono text-slate-100 shadow-[0_0_80px_rgba(34,211,238,0.28)]">
        {/* CABECERA DEL MODAL */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="rounded border border-cyan-500/50 bg-cyan-950 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-cyan-300">
              DOCUMENTACIÓN INTEGRADA PARA JURADO NASA SPACE APPS
            </span>
            <h2 className="mt-1 text-base sm:text-xl font-black text-white">
              AUDITORÍA CIENTÍFICA, TRAZABILIDAD DE DATOS Y FUENTES OFICIALES NASA
            </h2>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            className="min-h-[44px] rounded-xl border-2 border-rose-500/70 bg-rose-950/60 px-4 py-2 text-xs font-black uppercase text-rose-200 transition-all hover:bg-rose-900 active:scale-95"
          >
            [✕ Cerrar Auditoría]
          </button>
        </div>

        {/* BARRA DE PESTAÑAS GRANDES APTAS PARA GUANTES */}
        <div className="my-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setPestana("MATRIZ")}
            className={`min-h-[48px] rounded-xl border-2 px-3 py-2 text-left text-xs font-black uppercase transition-all ${
              pestana === "MATRIZ"
                ? "border-cyan-400 bg-cyan-500/20 text-white shadow-[0_0_15px_rgba(34,211,238,0.25)]"
                : "border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-600"
            }`}
          >
            Pestaña A: Matriz de Honestidad de Datos ({todosLosRegistros.length})
          </button>

          <button
            type="button"
            onClick={() => setPestana("MODELO")}
            className={`min-h-[48px] rounded-xl border-2 px-3 py-2 text-left text-xs font-black uppercase transition-all ${
              pestana === "MODELO"
                ? "border-amber-400 bg-amber-500/20 text-white shadow-[0_0_15px_rgba(251,191,36,0.25)]"
                : "border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-600"
            }`}
          >
            Pestaña B: Modelo Matemático de Supervivencia
          </button>

          <button
            type="button"
            onClick={() => setPestana("FUENTES")}
            className={`min-h-[48px] rounded-xl border-2 px-3 py-2 text-left text-xs font-black uppercase transition-all ${
              pestana === "FUENTES"
                ? "border-emerald-400 bg-emerald-500/20 text-white shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                : "border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-600"
            }`}
          >
            Pestaña C: Fuentes Oficiales Vinculadas ({fuentesOficiales.length})
          </button>
        </div>

        {/* CONTENIDO DE LA PESTAÑA ACTIVA */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* PESTAÑA A: MATRIZ DE HONESTIDAD DE DATOS */}
          {pestana === "MATRIZ" && (
            <div className="space-y-3">
              {/* Filtros rápidos y contadores de trazabilidad */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFiltroOrigen("TODOS")}
                    className={`rounded-lg border px-2.5 py-1 font-bold ${
                      filtroOrigen === "TODOS"
                        ? "border-white bg-slate-700 text-white"
                        : "border-slate-700 bg-slate-950 text-slate-400"
                    }`}
                  >
                    TODOS ({todosLosRegistros.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltroOrigen("medido")}
                    className={`rounded-lg border px-2.5 py-1 font-bold ${
                      filtroOrigen === "medido"
                        ? "border-emerald-400 bg-emerald-950 text-emerald-200"
                        : "border-slate-700 bg-slate-950 text-emerald-400"
                    }`}
                  >
                    [MEDIDO] ({totalMedidos})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltroOrigen("derivado")}
                    className={`rounded-lg border px-2.5 py-1 font-bold ${
                      filtroOrigen === "derivado"
                        ? "border-sky-400 bg-sky-950 text-sky-200"
                        : "border-slate-700 bg-slate-950 text-sky-400"
                    }`}
                  >
                    [DERIVADO] ({totalDerivados})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltroOrigen("simulado")}
                    className={`rounded-lg border px-2.5 py-1 font-bold ${
                      filtroOrigen === "simulado"
                        ? "border-amber-400 bg-amber-950 text-amber-200"
                        : "border-slate-700 bg-slate-950 text-amber-400"
                    }`}
                  >
                    [SIMULADO] ({totalSimulados})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltroOrigen("NULOS")}
                    className={`rounded-lg border px-2.5 py-1 font-bold ${
                      filtroOrigen === "NULOS"
                        ? "border-rose-400 bg-rose-950 text-rose-200"
                        : "border-slate-700 bg-slate-950 text-rose-300"
                    }`}
                  >
                    ⚠ COBERTURA NULA EXPLÍCITA ({totalNulos})
                  </button>
                </div>

                <span className="text-[11px] text-slate-400">
                  Generado automáticamente desde <code>src/data/boxwork_mission.ts</code>
                </span>
              </div>

              {/* Tabla resumen de variables */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900 text-[11px] uppercase text-slate-400">
                      <th className="p-2.5">Nodo / Contexto</th>
                      <th className="p-2.5">Variable</th>
                      <th className="p-2.5">Valor / Estado Cobertura</th>
                      <th className="p-2.5">Clasificación</th>
                      <th className="p-2.5">Instrumento</th>
                      <th className="p-2.5">Sol / Fecha</th>
                      <th className="p-2.5">Fuente</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-950/70">
                    {registrosFiltrados.map(({ contextoNodo, capa, registro }) => {
                      const esNulo = registro.valor === null;
                      return (
                        <tr
                          key={registro.id}
                          className={
                            esNulo ? "bg-slate-900/90" : "hover:bg-slate-900/50"
                          }
                        >
                          <td className="p-2.5">
                            <div className="font-bold text-cyan-300">
                              {contextoNodo}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {capa}
                            </div>
                          </td>
                          <td className="p-2.5 font-bold text-white">
                            {registro.nombre}
                          </td>
                          <td className="p-2.5">
                            {esNulo ? (
                              <div className="rounded border border-slate-600 bg-slate-800 px-2 py-1 text-[11px] font-bold text-slate-200">
                                Sin cobertura/medición directa (No extrapolado)
                                {registro.notaCobertura && (
                                  <p className="mt-0.5 text-[10px] font-normal text-slate-400">
                                    {registro.notaCobertura}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="font-black text-emerald-200">
                                {registro.valor}{" "}
                                <span className="font-normal text-slate-400">
                                  {registro.unidad}
                                </span>
                              </span>
                            )}
                          </td>
                          <td className="p-2.5">
                            <span
                              className={`rounded border px-2 py-0.5 text-[10px] font-black uppercase ${
                                BADGE_ORIGEN[registro.clasificacion]
                              }`}
                            >
                              [{registro.clasificacion.toUpperCase()}]
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-300">
                            {registro.instrumento}
                          </td>
                          <td className="p-2.5 text-slate-300">
                            {registro.fechaOSol}
                          </td>
                          <td className="p-2.5">
                            <a
                              href={registro.fuenteUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded border border-cyan-500/40 bg-slate-900 px-2 py-1 text-[10px] font-bold text-cyan-300 hover:bg-slate-800"
                            >
                              Abrir ↗
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PESTAÑA B: MODELO MATEMÁTICO DE SUPERVIVENCIA */}
          {pestana === "MODELO" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-amber-500/50 bg-amber-950/20 p-4">
                <h3 className="text-sm font-black uppercase text-amber-300">
                  1. Ecuaciones Fundamentales del Motor de Supervivencia EVA
                </h3>
                <div className="mt-2.5 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-700 bg-slate-950/90 p-3">
                    <span className="text-[10px] font-bold uppercase text-cyan-400">
                      Ecuación de Tiempo Operativo
                    </span>
                    <p className="mt-1 text-xs sm:text-sm font-black text-white">
                      Tiempo total de EVA = Desplazamiento de ida + Paradas
                      científicas + Desplazamiento de regreso
                    </p>
                    <p className="mt-1.5 text-[11px] text-slate-300">
                      El astronauta camina todo el recorrido a la misma velocidad
                      ({parametros.velocidadCaminataKmHora} km/h) tanto en modo{" "}
                      <strong>Astronauta Solo</strong> como en{" "}
                      <strong>Astronauta + Rover de Apoyo</strong>.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-700 bg-slate-950/90 p-3">
                    <span className="text-[10px] font-bold uppercase text-emerald-400">
                      Ecuación Metabólica de Oxígeno
                    </span>
                    <p className="mt-1 text-xs sm:text-sm font-black text-white">
                      Oxígeno utilizado = Horas de EVA × 0.076 kg/h
                    </p>
                    <p className="mt-1.5 text-[11px] text-slate-300">
                      El valor de <strong>0.076 kg/h</strong> proviene del
                      documento{" "}
                      <em>
                        NASA Life Support Baseline Values and Assumptions (BVAD)
                      </em>{" "}
                      como referencia de magnitud para un sistema cerrado.
                    </p>
                  </div>
                </div>
              </div>

              {/* Aclaración de Honestidad Científica sobre Reglas del Prototipo */}
              <div className="rounded-2xl border border-cyan-500/40 bg-slate-900/90 p-4">
                <h3 className="text-sm font-black uppercase text-cyan-300">
                  2. Distinción Estricta entre Referencia NASA y Reglas del Prototipo
                </h3>
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-xs text-slate-200">
                  <li>
                    <strong>Capacidad inicial del tanque PLSS (0.380 kg = 5.0 h)</strong> y{" "}
                    <strong>Umbral de Reserva Mínima del 25%</strong> son{" "}
                    <span className="text-amber-300 font-bold">
                      parámetros explícitos del prototipo [SIMULADO]
                    </span>
                    , no límites médicos ni operativos certificados por NASA.
                  </li>
                  <li>
                    <strong>Función explícita del Rover acompañante:</strong>{" "}
                    Transportar herramientas/muestras y realizar pre-escaneo
                    óptico de objetivos. Esto reduce la duración operativa de la
                    Parada Científica 1 de <strong>30 min a 15 min</strong> y la
                    del Desvío (Nodo 4) de <strong>40 min a 15 min</strong>, a
                    cambio de consumir <strong>Energía del Rover (%)</strong>.
                  </li>
                  <li>
                    <strong>Filtro de Seguridad Previo (Regla de 4 Pasos):</strong>{" "}
                    La seguridad actúa como filtro previo innegociable. El Nodo
                    2 (PIA26364, pendiente 24.5° &gt; 22°) queda excluido, y el
                    desvío al Nodo 4 (PIA26697) se rechaza en modo{" "}
                    <em>Astronauta Solo</em> porque deja el O2 de retorno en{" "}
                    <strong>18.3% (&lt; 25%)</strong>, pero se aprueba en modo{" "}
                    <em>Con Rover</em> porque retorna con{" "}
                    <strong>26.7% (&gt;= 25%)</strong>.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* PESTAÑA C: FUENTES OFICIALES VINCULADAS */}
          {pestana === "FUENTES" && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {fuentesOficiales.map((f, idx) => (
                <div
                  key={idx}
                  className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/90 p-3.5 hover:border-cyan-500/50"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                      {f.categoria}
                    </span>
                    <h4 className="mt-1 text-xs sm:text-sm font-black text-white">
                      {f.titulo}
                    </h4>
                    <p className="mt-1 text-[11px] text-slate-300">{f.uso}</p>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-2">
                    <span className="truncate text-[10px] text-slate-500">
                      {f.url}
                    </span>
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-2 shrink-0 rounded-lg border border-emerald-500/50 bg-emerald-950/70 px-3 py-1 text-[11px] font-black text-emerald-300 hover:bg-emerald-900"
                    >
                      Abrir Fuente Oficial ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PIE DEL MODAL */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-2.5 text-[11px] text-slate-400">
          <span>
            NASA Space Apps Challenge — Desafío: Guía de Supervivencia
            Interplanetaria (Mount Sharp / Sector Boxwork)
          </span>
          <span className="text-cyan-300 font-bold">
            Stack T3 (Next.js + TypeScript Estricto + tRPC + Tailwind CSS)
          </span>
        </div>
      </div>
    </div>
  );
}
