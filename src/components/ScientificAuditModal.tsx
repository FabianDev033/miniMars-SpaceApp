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
  medido: "border-emerald-400 text-emerald-300",
  derivado: "border-cyan-400 text-cyan-300",
  simulado: "border-violet-400 text-violet-300",
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
  const paradaN3 = nodos.find((nodo) => nodo.orden === 3)?.duracionParadaMin;
  const paradaN4 = nodos.find((nodo) => nodo.orden === 4)?.duracionParadaMin;

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
      <div className="flex h-[calc(100vh-3rem)] w-full max-w-none flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#0d0d10] p-4 font-mono text-slate-100 shadow-2xl sm:p-6">
        {/* CABECERA DEL MODAL */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
              Auditoría científica · Trazabilidad de datos
            </span>
            <h2 className="mt-1 text-lg font-bold text-slate-100 sm:text-2xl">
              Mount Sharp — sector boxwork
            </h2>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            className="min-h-[44px] rounded-xl border border-[#f07eb4] bg-transparent px-4 py-2 text-sm font-medium text-[#f07eb4] transition-colors hover:bg-rose-950/30 active:scale-95"
          >
            ✕ Cerrar auditoría
          </button>
        </div>

        {/* BARRA DE PESTAÑAS GRANDES APTAS PARA GUANTES */}
        <div className="my-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setPestana("MATRIZ")}
            className={`min-h-[52px] rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
              pestana === "MATRIZ"
                ? "border-cyan-400 bg-cyan-400 text-slate-950"
                : "border-slate-800 bg-transparent text-slate-200 hover:border-slate-600"
            }`}
          >
            A · Honestidad de datos
          </button>

          <button
            type="button"
            onClick={() => setPestana("MODELO")}
            className={`min-h-[52px] rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
              pestana === "MODELO"
                ? "border-cyan-400 bg-cyan-400 text-slate-950"
                : "border-slate-800 bg-transparent text-slate-200 hover:border-slate-600"
            }`}
          >
            B · Modelo de supervivencia
          </button>

          <button
            type="button"
            onClick={() => setPestana("FUENTES")}
            className={`min-h-[52px] rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
              pestana === "FUENTES"
                ? "border-cyan-400 bg-cyan-400 text-slate-950"
                : "border-slate-800 bg-transparent text-slate-200 hover:border-slate-600"
            }`}
          >
            C · Fuentes oficiales
          </button>
        </div>

        {/* CONTENIDO DE LA PESTAÑA ACTIVA */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* PESTAÑA A: MATRIZ DE HONESTIDAD DE DATOS */}
          {pestana === "MATRIZ" && (
            <div className="space-y-3">
              {/* Filtros rápidos y contadores de trazabilidad */}
              <div className="flex flex-wrap items-center justify-between gap-2 py-1 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFiltroOrigen("TODOS")}
                    className={`min-h-10 rounded-xl border px-4 py-2 font-medium ${
                      filtroOrigen === "TODOS"
                        ? "border-cyan-400 bg-cyan-400 text-slate-950"
                        : "border-slate-800 bg-transparent text-slate-200"
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltroOrigen("medido")}
                    className={`min-h-10 rounded-xl border px-4 py-2 font-medium ${
                      filtroOrigen === "medido"
                        ? "border-cyan-400 bg-cyan-400 text-slate-950"
                        : "border-slate-800 bg-transparent text-slate-200"
                    }`}
                  >
                    Medido
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltroOrigen("derivado")}
                    className={`min-h-10 rounded-xl border px-4 py-2 font-medium ${
                      filtroOrigen === "derivado"
                        ? "border-cyan-400 bg-cyan-400 text-slate-950"
                        : "border-slate-800 bg-transparent text-slate-200"
                    }`}
                  >
                    Derivado
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltroOrigen("simulado")}
                    className={`min-h-10 rounded-xl border px-4 py-2 font-medium ${
                      filtroOrigen === "simulado"
                        ? "border-cyan-400 bg-cyan-400 text-slate-950"
                        : "border-slate-800 bg-transparent text-slate-200"
                    }`}
                  >
                    Simulado
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltroOrigen("NULOS")}
                    className={`min-h-10 rounded-xl border px-4 py-2 font-medium ${
                      filtroOrigen === "NULOS"
                        ? "border-cyan-400 bg-cyan-400 text-slate-950"
                        : "border-slate-800 bg-transparent text-slate-200"
                    }`}
                  >
                    Sin cobertura
                  </button>
                </div>

                <span className="text-[11px] text-slate-400">
                  Mostrando {registrosFiltrados.length} de {todosLosRegistros.length} variables
                </span>
              </div>

              {/* Tabla resumen de variables */}
              <div className="h-full overflow-auto rounded-2xl border border-slate-800 bg-slate-900">
                <table className="w-full min-w-[760px] border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                      <th className="p-3">Variable</th>
                      <th className="p-3">Valor</th>
                      <th className="p-3">Tipo</th>
                      <th className="p-3">Fuente</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {registrosFiltrados.map(({ contextoNodo, capa, registro }) => {
                      const esNulo = registro.valor === null;
                      return (
                        <tr
                          key={registro.id}
                          className={
                            esNulo ? "bg-slate-900/90" : "hover:bg-slate-900/50"
                          }
                        >
                          <td className="p-3">
                            <div className="font-bold text-slate-100">
                              {registro.nombre}
                            </div>
                            <div className="mt-0.5 text-[11px] text-slate-400">
                              {contextoNodo} · {capa}
                            </div>
                          </td>
                          <td className="p-3 font-bold text-slate-100">
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
                          <td className="p-3">
                            <span
                              className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium capitalize ${
                                BADGE_ORIGEN[registro.clasificacion]
                              }`}
                            >
                              {registro.clasificacion}
                            </span>
                          </td>
                          <td className="p-3">
                            <a
                              href={registro.fuenteUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-medium text-cyan-300 underline decoration-cyan-900 underline-offset-4 transition-colors hover:text-cyan-200"
                            >
                              {registro.instrumento} ↗
                            </a>
                            <p className="mt-1 text-[11px] text-slate-400">
                              {registro.fechaOSol}
                            </p>
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
            <div className="space-y-4 pb-2">
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400">Tiempo total de EVA</p>
                  <h3 className="mt-3 text-xl font-bold text-cyan-300">Ida + Ciencia + Regreso</h3>
                  <p className="mt-2 text-xs text-slate-300">Misma velocidad en ambos modos: {parametros.velocidadCaminataKmHora} km/h</p>
                </section>
                <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400">Oxígeno utilizado</p>
                  <h3 className="mt-3 text-xl font-bold text-cyan-300">Horas de EVA × {parametros.tasaOxigenoKgHora} kg/h</h3>
                  <p className="mt-2 text-xs text-slate-300">Referencia de magnitud: NASA BVAD 2022</p>
                </section>
              </div>

              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                Reglas del prototipo · simuladas, no son límites de NASA
              </p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                  <p className="text-2xl font-bold text-violet-300">{parametros.capacidadInicialO2Kg.toFixed(2)} kg</p>
                  <p className="mt-2 text-xs text-slate-300">Tanque ≈ 5 h de autonomía</p>
                </section>
                <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                  <p className="text-2xl font-bold text-violet-300">{parametros.reservaMinimaO2Porcentaje} %</p>
                  <p className="mt-2 text-xs text-slate-300">Reserva mínima de O₂ al regreso</p>
                </section>
                <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                  <p className="text-2xl font-bold text-violet-300">
                    {paradaN3?.solo ?? 30} → {paradaN3?.conRover ?? 15} min
                  </p>
                  <p className="mt-2 text-xs text-slate-300">
                    Parada científica con rover · N4: {paradaN4?.solo ?? 40} → {paradaN4?.conRover ?? 15} min
                  </p>
                </section>
              </div>

              <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-[11px] uppercase tracking-wider text-slate-400">Filtro de seguridad · desvío a N4</p>
                <div className="mt-4 space-y-4">
                  {[
                    { nombre: "Astronauta solo", valor: 18.3, color: "bg-rose-400", estado: "rechazado", estadoColor: "text-rose-300" },
                    { nombre: "Con rover", valor: 26.7, color: "bg-emerald-300", estado: "aprobado", estadoColor: "text-emerald-300" },
                  ].map((fila) => (
                    <div key={fila.nombre} className="grid grid-cols-[120px_1fr_auto] items-center gap-3 text-xs sm:grid-cols-[170px_1fr_auto]">
                      <span className="text-slate-200">{fila.nombre}</span>
                      <div className="relative h-2 overflow-visible rounded-full bg-slate-800">
                        <div className={`h-full rounded-full ${fila.color}`} style={{ width: `${(fila.valor / 40) * 100}%` }} />
                        <span className="absolute -top-1 h-4 w-0.5 bg-white" style={{ left: `${(parametros.reservaMinimaO2Porcentaje / 40) * 100}%` }} />
                      </div>
                      <span className={`whitespace-nowrap font-bold ${fila.estadoColor}`}>{fila.valor} % · {fila.estado}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-slate-400">
                  Escala 0–40 % · marca de reserva {parametros.reservaMinimaO2Porcentaje} % · N2 (24.5° &gt; 22°) se excluye antes de evaluar el desvío.
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  El rover reduce la parada N3 de {paradaN3?.solo ?? 30} a {paradaN3?.conRover ?? 15} min y N4 de {paradaN4?.solo ?? 40} a {paradaN4?.conRover ?? 15} min al transportar instrumentos y hacer un preescaneo óptico.
                </p>
              </section>
            </div>
          )}

          {/* PESTAÑA C: FUENTES OFICIALES VINCULADAS */}
          {pestana === "FUENTES" && (
            <div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
                {fuentesOficiales.map((f, idx) => (
                  <div
                    key={idx}
                    className="flex min-h-[240px] flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900 p-4 transition-colors hover:border-cyan-500/50"
                  >
                    <div>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                        {f.categoria}
                      </span>
                      <h4 className="mt-1 text-xs font-black text-white sm:text-sm">
                        {f.titulo}
                      </h4>
                      <p className="mt-1 text-[11px] text-slate-300">{f.uso}</p>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-2">
                      <span className="truncate text-[10px] text-slate-500">
                        {new URL(f.url).hostname}
                      </span>
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-2 shrink-0 rounded-lg border border-cyan-400 px-3 py-2 text-[11px] font-medium text-cyan-300 transition-colors hover:bg-cyan-950/40"
                      >
                        Abrir ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-400">
                Mostrando {fuentesOficiales.length} de {fuentesOficiales.length} fuentes vinculadas
              </p>
            </div>
          )}
        </div>

        {/* PIE DEL MODAL */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-2.5 text-[11px] text-slate-400">
          <span>
            NASA Space Apps Challenge — Desafío: Guía de Supervivencia
            Interplanetaria (Mount Sharp / Sector Boxwork)
          </span>
        </div>
      </div>
    </div>
  );
}
