"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import type { EstadoEtapaEva } from "~/components/EvaSequencePlayer";
import type {
  MissionMode,
  MissionSimulationResult,
  WaypointNode,
} from "~/types/mission";

interface MarsTrekLeafletMapProps {
  nodos: WaypointNode[];
  nodoSeleccionadoId: string;
  onSelectNodo: (id: string) => void;
  includeDetour: boolean;
  simulation: MissionSimulationResult;
  mode: MissionMode;
  estadoEtapa: EstadoEtapaEva;
  capa41Activa: boolean;
  opacidad41: number;
  capa42Activa: boolean;
  opacidad42: number;
  capa43Activa: boolean;
  opacidad43: number;
}

/**
 * PIRÁMIDE OFICIAL DE CAPAS ORBITALES REALES — NASA/JPL MARS TREK OGC WMTS
 * Proyección: Equirectangular (EPSG:4326 / default028mm)
 * Documentación oficial: https://trek.nasa.gov/tiles/apidoc/marsWMTS.html
 *
 * 1. Global (232 m/px): Mars_Viking_MDIM21_ClrMosaic_global_232m
 * 2. Regional Cráter Gale (MRO CTX ~5 m/px): Gale_CTX_BlockAdj_dd
 *    BBox: [135.1842, -6.5732, 139.2413, -2.8077]
 * 3. Local Sitio de Exploración de Curiosity / Mount Sharp (MRO HiRISE ~0.25 m/px): curiosity_hirise_mosaic
 *    BBox: [137.1224, -4.9254, 137.7298, -4.2489]
 * 4. Altimetría MOLA (Capa 4.1): Mars_MGS_MOLA_ClrShade_merge_global_463m
 * 5. Inercia Térmica THEMIS IR 100m (Capa 4.3): THEMIS_DayIR_ControlledMosaics_100m
 */
const NASA_WMTS_URLS = {
  VIKING_GLOBAL_232M:
    "https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg",
  GALE_CTX_5M:
    "https://trek.nasa.gov/tiles/Mars/EQ/Gale_CTX_BlockAdj_dd/1.0.0/default/default028mm/{z}/{y}/{x}.png",
  CURIOSITY_HIRISE_25CM:
    "https://trek.nasa.gov/tiles/Mars/EQ/curiosity_hirise_mosaic/1.0.0/default/default028mm/{z}/{y}/{x}.png",
  MOLA_TOPOGRAPHY:
    "https://trek.nasa.gov/tiles/Mars/EQ/Mars_MGS_MOLA_ClrShade_merge_global_463m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg",
  THEMIS_THERMAL_IR:
    "https://trek.nasa.gov/tiles/Mars/EQ/THEMIS_DayIR_ControlledMosaics_100m/1.0.0/default/default028mm/{z}/{y}/{x}.png",
  CURIOSITY_ARCGIS_PATH_GEOJSON:
    "https://trek.nasa.gov/mars/trekarcgis/rest/services/curiosity_path/MapServer/0/query?where=1%3D1&outFields=*&f=geojson",
} as const;

// Coordenadas reales [lat, lon] del corredor histórico de Curiosity en el sector Boxwork (N1 -> N3 rodeando N2)
const COORDENADAS_RUTA_CURIOSITY: Array<[number, number]> = [
  [-4.6805, 137.3612], // Nodo 1: Inicio Seguro (Sol 4476)
  [-4.6814, 137.3617], // Waypoint intermedio Sol 4488
  [-4.6823, 137.3623], // Waypoint intermedio Sol 4501 (rodeando por el sur el talud >22° del Nodo 2)
  [-4.683, 137.3631], // Waypoint intermedio Sol 4518
  [-4.6835, 137.3639], // Waypoint intermedio Sol 4531
  [-4.6838, 137.3646], // Nodo 3: Parada Científica 1 Boxwork (Sol 4541)
];

// Coordenadas [lat, lon] del desvío simulado sobre cartografía real de HiRISE (N3 -> N4)
const COORDENADAS_DESVIO_SIMULADO: Array<[number, number]> = [
  [-4.6838, 137.3646], // Nodo 3
  [-4.6844, 137.3653],
  [-4.6849, 137.3661],
  [-4.6854, 137.3668], // Nodo 4: Desvío Nódulos (PIA26697)
];

function obtenerLatLonEtapa(
  etapa: number,
  includeDetour: boolean
): [number, number] {
  switch (etapa) {
    case 1:
      return [-4.6805, 137.3612];
    case 2:
      return [-4.6823, 137.3623];
    case 3:
      return [-4.6838, 137.3646];
    case 4:
      return includeDetour
        ? [-4.6854, 137.3668]
        : [-4.6838, 137.3646];
    case 5:
    default:
      return [-4.6805, 137.3612];
  }
}

export default function MarsTrekLeafletMap({
  nodos,
  nodoSeleccionadoId,
  onSelectNodo,
  includeDetour,
  simulation,
  mode,
  estadoEtapa,
  capa41Activa,
  opacidad41,
  capa42Activa,
  opacidad42,
  capa43Activa,
  opacidad43,
}: MarsTrekLeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Referencias a las capas reales WMTS de NASA Mars Trek
  const vikingGlobalLayerRef = useRef<L.TileLayer | null>(null);
  const galeCtxLayerRef = useRef<L.TileLayer | null>(null);
  const curiosityHiRiseLayerRef = useRef<L.TileLayer | null>(null);
  const molaTileLayerRef = useRef<L.TileLayer | null>(null);
  const themisTileLayerRef = useRef<L.TileLayer | null>(null);

  const vectorGroupRef = useRef<L.LayerGroup | null>(null);
  const curiosityFullTrackGroupRef = useRef<L.LayerGroup | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const astronautMarkerRef = useRef<L.Marker | null>(null);

  const [nivelZoomActual, setNivelZoomActual] = useState<number>(14);
  const [coordenadasCursor, setCoordenadasCursor] = useState<{
    lat: number;
    lon: number;
  }>({ lat: -4.6828, lon: 137.3638 });
  const [mostrarSubcapaMolaColor, setMostrarSubcapaMolaColor] =
    useState<boolean>(false);

  // 1. Inicializar Mapa Leaflet con la pirámide real de 3 niveles de NASA Mars Trek (Viking -> CTX -> HiRISE)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      crs: L.CRS.EPSG4326,
      center: [-4.6828, 137.3638],
      zoom: 14,
      minZoom: 1,
      maxZoom: 17,
      zoomSnap: 0.5,
      zoomControl: false,
      attributionControl: true,
    });

    mapInstanceRef.current = map;

    // NIVEL 1 (Global 232 m/px): Viking MDIM 2.1 Color Mosaic
    const vikingLayer = L.tileLayer(NASA_WMTS_URLS.VIKING_GLOBAL_232M, {
      minZoom: 1,
      maxNativeZoom: 7,
      maxZoom: 17,
      opacity: 1,
      attribution:
        "NASA/JPL-Caltech Mars Trek WMTS (Viking / MRO CTX / MRO HiRISE / MOLA)",
    }).addTo(map);
    vikingGlobalLayerRef.current = vikingLayer;

    // NIVEL 2 (Regional Cráter Gale ~5 m/px): MRO CTX Block-Adjusted Mosaic
    const galeBounds = L.latLngBounds(
      [-6.5732988, 135.1842593],
      [-2.8077809, 139.2413012]
    );
    const galeCtxLayer = L.tileLayer(NASA_WMTS_URLS.GALE_CTX_5M, {
      minZoom: 5,
      maxNativeZoom: 11,
      maxZoom: 17,
      bounds: galeBounds,
      opacity: 1,
    }).addTo(map);
    galeCtxLayerRef.current = galeCtxLayer;

    // NIVEL 3 (Máximo acercamiento en el sitio de Curiosity y Mount Sharp ~0.25 m/px): MRO HiRISE Mosaic
    const hiRiseBounds = L.latLngBounds(
      [-4.9254743, 137.1224669],
      [-4.2489588, 137.7298129]
    );
    const curiosityHiRiseLayer = L.tileLayer(
      NASA_WMTS_URLS.CURIOSITY_HIRISE_25CM,
      {
        minZoom: 8,
        maxNativeZoom: 15,
        maxZoom: 17,
        bounds: hiRiseBounds,
        opacity: 1,
      }
    ).addTo(map);
    curiosityHiRiseLayerRef.current = curiosityHiRiseLayer;

    // CAPA 4.1 OPCIONAL DE FALSO COLOR TOPOGRÁFICO MOLA (desactivada por defecto para no teñir la foto satelital real HiRISE)
    const molaLayer = L.tileLayer(NASA_WMTS_URLS.MOLA_TOPOGRAPHY, {
      minZoom: 1,
      maxNativeZoom: 6,
      maxZoom: 17,
      opacity: 0,
    }).addTo(map);
    molaTileLayerRef.current = molaLayer;

    // CAPA 4.3 WMTS: Inercia Térmica Diurna THEMIS IR (100m)
    const themisLayer = L.tileLayer(NASA_WMTS_URLS.THEMIS_THERMAL_IR, {
      minZoom: 1,
      maxNativeZoom: 8,
      maxZoom: 17,
      opacity: 0,
    }).addTo(map);
    themisTileLayerRef.current = themisLayer;

    // Grupos vectoriales
    curiosityFullTrackGroupRef.current = L.layerGroup().addTo(map);
    vectorGroupRef.current = L.layerGroup().addTo(map);
    markersGroupRef.current = L.layerGroup().addTo(map);

    // Cargar en segundo plano la polilínea histórica completa de Curiosity desde el MapServer oficial de NASA Mars Trek
    fetch(NASA_WMTS_URLS.CURIOSITY_ARCGIS_PATH_GEOJSON)
      .then((res) => (res.ok ? res.json() : null))
      .then((geojson) => {
        if (!geojson || !curiosityFullTrackGroupRef.current) return;
        L.geoJSON(geojson, {
          style: {
            color: "#38bdf8",
            weight: 2,
            opacity: 0.65,
            dashArray: "4, 4",
          },
        }).addTo(curiosityFullTrackGroupRef.current);
      })
      .catch(() => {
        // Si no hay conexión al ArcGIS MapServer externo, se mantiene nuestra polilínea local tipada
      });

    map.on("zoomend", () => {
      setNivelZoomActual(Number(map.getZoom().toFixed(1)));
    });

    map.on("mousemove", (e: L.LeafletMouseEvent) => {
      setCoordenadasCursor({
        lat: Number(e.latlng.lat.toFixed(5)),
        lon: Number(e.latlng.lng.toFixed(5)),
      });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Actualizar opacidades de las capas reales WMTS (Viking + CTX + HiRISE, MOLA y THEMIS)
  useEffect(() => {
    const alpha41 = capa41Activa ? opacidad41 / 100 : 0;

    if (vikingGlobalLayerRef.current) {
      vikingGlobalLayerRef.current.setOpacity(alpha41);
    }
    if (galeCtxLayerRef.current) {
      galeCtxLayerRef.current.setOpacity(alpha41);
    }
    if (curiosityHiRiseLayerRef.current) {
      curiosityHiRiseLayerRef.current.setOpacity(alpha41);
    }
    if (molaTileLayerRef.current) {
      molaTileLayerRef.current.setOpacity(
        capa41Activa && mostrarSubcapaMolaColor ? alpha41 * 0.45 : 0
      );
    }
    if (themisTileLayerRef.current) {
      const alpha43 = capa43Activa ? (opacidad43 / 100) * 0.4 : 0;
      themisTileLayerRef.current.setOpacity(alpha43);
    }
  }, [
    capa41Activa,
    opacidad41,
    capa43Activa,
    opacidad43,
    mostrarSubcapaMolaColor,
  ]);

  // 3. Dibujar Trazado de Ruta EVA, Desvío Simulado, Zona de Exclusión (>22°) y Anillo Walk-Back Limit sobre la imagen HiRISE real
  useEffect(() => {
    const vectorGroup = vectorGroupRef.current;
    if (!vectorGroup) return;

    vectorGroup.clearLayers();

    const nodo1 = nodos.find((n) => n.orden === 1);
    const nodo2 = nodos.find((n) => n.orden === 2);

    // A) Anillo de Límite de Regreso Seguro (Walk-Back Limit 25% O2)
    if (nodo1) {
      const radioMetros = simulation.oxigeno.perforaReserva25 ? 210 : 340;
      const colorAnillo = simulation.oxigeno.perforaReserva25
        ? "#f43f5e"
        : "#10b981";

      L.circle([nodo1.coordenadasMapa.lat, nodo1.coordenadasMapa.lon], {
        radius: radioMetros,
        color: colorAnillo,
        weight: 2,
        dashArray: "8, 6",
        fillColor: colorAnillo,
        fillOpacity: 0.04,
        interactive: false,
      }).addTo(vectorGroup);
    }

    // B) Zona de Exclusión en Rojo sobre el Nodo 2 (Pendiente >22° / Rocas Angulares)
    if (nodo2) {
      L.circle([nodo2.coordenadasMapa.lat, nodo2.coordenadasMapa.lon], {
        radius: 68,
        color: "#f43f5e",
        weight: 2.5,
        dashArray: "6, 4",
        fillColor: "#f43f5e",
        fillOpacity: 0.25,
        interactive: false,
      }).addTo(vectorGroup);

      if (nodo1) {
        L.polyline(
          [
            [nodo1.coordenadasMapa.lat, nodo1.coordenadasMapa.lon],
            [nodo2.coordenadasMapa.lat, nodo2.coordenadasMapa.lon],
          ],
          {
            color: "#f43f5e",
            weight: 3,
            dashArray: "6, 6",
            opacity: 0.9,
            interactive: false,
          }
        ).addTo(vectorGroup);
      }
    }

    // C) Trayecto Histórico Real de Curiosity en el sector Boxwork (Línea sólida cian sobre la fotografía HiRISE real)
    L.polyline(COORDENADAS_RUTA_CURIOSITY, {
      color: "#082f49",
      weight: 9,
      opacity: 0.9,
      lineCap: "round",
      lineJoin: "round",
      interactive: false,
    }).addTo(vectorGroup);

    L.polyline(COORDENADAS_RUTA_CURIOSITY, {
      color: "#22d3ee",
      weight: 4.5,
      opacity: 1,
      lineCap: "round",
      lineJoin: "round",
      interactive: false,
    }).addTo(vectorGroup);

    COORDENADAS_RUTA_CURIOSITY.forEach((coord) => {
      L.circleMarker(coord, {
        radius: 3.5,
        color: "#0284c7",
        weight: 1.5,
        fillColor: "#ffffff",
        fillOpacity: 1,
        interactive: false,
      }).addTo(vectorGroup);
    });

    // D) Desvío Simulado hacia Parada Científica 2 (Nodo 4 - PIA26697)
    L.polyline(COORDENADAS_DESVIO_SIMULADO, {
      color: "#451a03",
      weight: 7,
      opacity: 0.85,
      interactive: false,
    }).addTo(vectorGroup);

    L.polyline(COORDENADAS_DESVIO_SIMULADO, {
      color: includeDetour ? "#fbbf24" : "#94a3b8",
      weight: includeDetour ? 4 : 2.5,
      dashArray: "10, 7",
      opacity: 1,
      interactive: false,
    }).addTo(vectorGroup);
  }, [nodos, includeDetour, simulation.oxigeno.perforaReserva25]);

  // 4. Renderizar los 4 Marcadores Interactivos y Telemetría Puntual RAD/REMS (Capa 4.2)
  useEffect(() => {
    const markersGroup = markersGroupRef.current;
    if (!markersGroup) return;

    markersGroup.clearLayers();

    nodos.forEach((nodo) => {
      const esSeleccionado = nodo.id === nodoSeleccionadoId;
      const esObstaculo = nodo.tipo === "obstaculo_exclusion";
      const esDesvio = !nodo.esRutaHistoricaCuriosity;

      const radRecord = nodo.capas.seguridadSupervivencia.find((r) =>
        r.instrumento.includes("RAD")
      );
      const remsRecord = nodo.capas.seguridadSupervivencia.find((r) =>
        r.instrumento.includes("REMS")
      );

      const borderPin = esSeleccionado
        ? "border-white bg-cyan-400 text-slate-950 ring-4 ring-cyan-300/70 scale-110"
        : esObstaculo
        ? "border-rose-400 bg-rose-950 text-rose-200"
        : esDesvio
        ? "border-amber-400 bg-amber-950 text-amber-200"
        : "border-cyan-300 bg-slate-900 text-cyan-200";

      const radHtml = capa42Activa
        ? `<div style="opacity:${opacidad42 / 100}" class="mt-1 flex flex-col items-center gap-0.5 text-[9px] font-mono">
              <span class="rounded border px-1.5 py-0.5 font-bold whitespace-nowrap shadow ${
                radRecord?.valor !== null && radRecord?.valor !== undefined
                  ? "border-emerald-500/70 bg-emerald-950/95 text-emerald-300"
                  : "border-slate-600 bg-slate-900/95 text-slate-400"
              }">
                RAD: ${
                  radRecord?.valor !== null && radRecord?.valor !== undefined
                    ? `${radRecord.valor} ${radRecord.unidad}`
                    : "Sin medición directa"
                }
              </span>
              ${
                remsRecord
                  ? `<span class="rounded border px-1.5 py-0.5 font-bold whitespace-nowrap shadow ${
                      remsRecord.valor !== null
                        ? "border-sky-500/70 bg-sky-950/95 text-sky-300"
                        : "border-slate-600 bg-slate-900/95 text-slate-400"
                    }">
                      REMS: ${
                        remsRecord.valor !== null
                          ? `${remsRecord.valor} ${remsRecord.unidad}`
                          : "Sin medición puntual"
                      }
                    </span>`
                  : ""
              }
            </div>`
        : "";

      const icon = L.divIcon({
        className: "mars-tactical-div-icon",
        iconSize: [140, 88],
        iconAnchor: [70, 22],
        html: `
          <div class="flex flex-col items-center select-none cursor-pointer">
            <div class="flex h-11 w-11 items-center justify-center rounded-full border-2 font-mono text-xs font-black shadow-[0_4px_14px_rgba(0,0,0,0.9)] transition-transform ${borderPin}">
              N${nodo.orden}
            </div>
            <div class="mt-1 whitespace-nowrap rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold shadow-lg ${
              esSeleccionado
                ? "border-cyan-300 bg-slate-950 text-cyan-200"
                : esObstaculo
                ? "border-rose-500/80 bg-rose-950/95 text-rose-200"
                : "border-slate-700 bg-slate-950/95 text-slate-200"
            }">
              ${nodo.imagenPov.codigoPia} • ${nodo.riesgoTramo.pendienteGrados}°
            </div>
            ${radHtml}
          </div>
        `,
      });

      const marker = L.marker(
        [nodo.coordenadasMapa.lat, nodo.coordenadasMapa.lon],
        { icon }
      );
      marker.on("click", () => {
        onSelectNodo(nodo.id);
      });
      marker.addTo(markersGroup);
    });
  }, [nodos, nodoSeleccionadoId, onSelectNodo, capa42Activa, opacidad42]);

  // 5. Actualizar posición [lat, lon] del marcador animado del Astronauta (+ Rover) según la Etapa EVA
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const coords = obtenerLatLonEtapa(estadoEtapa.etapa, includeDetour);

    const iconHtml = `
      <div class="flex flex-col items-center pointer-events-none select-none">
        <div class="flex items-center gap-1 rounded-full border-2 border-yellow-300 bg-slate-950/95 px-2.5 py-1 font-mono text-[10px] font-black text-yellow-300 shadow-[0_0_20px_rgba(253,224,71,0.9)] whitespace-nowrap">
          <span>🧑‍🚀 EVA</span>
          ${
            mode === "conRover"
              ? '<span class="text-amber-300">+ 🛞 ROVER</span>'
              : ""
          }
        </div>
        <span class="mt-0.5 rounded bg-yellow-400 px-1.5 py-0.2 font-mono text-[9px] font-black text-slate-950 shadow whitespace-nowrap">
          ${estadoEtapa.posicionMapa.etiqueta}
        </span>
      </div>
    `;

    const evaIcon = L.divIcon({
      className: "mars-tactical-div-icon",
      iconSize: [150, 46],
      iconAnchor: [75, 42],
      html: iconHtml,
    });

    if (!astronautMarkerRef.current) {
      astronautMarkerRef.current = L.marker(coords, {
        icon: evaIcon,
        zIndexOffset: 1000,
        interactive: false,
      }).addTo(map);
    } else {
      astronautMarkerRef.current.setLatLng(coords);
      astronautMarkerRef.current.setIcon(evaIcon);
    }
  }, [estadoEtapa, includeDetour, mode]);

  const irASectorBoxwork = () => {
    mapInstanceRef.current?.flyTo([-4.6828, 137.3638], 14, { duration: 1.1 });
  };

  const irACraterGale = () => {
    mapInstanceRef.current?.flyTo([-4.6828, 137.3638], 9, { duration: 1.2 });
  };

  const irAMarteGlobal = () => {
    mapInstanceRef.current?.flyTo([-4.68, 137.36], 3, { duration: 1.2 });
  };

  const hacerZoomIn = () => mapInstanceRef.current?.zoomIn(1);
  const hacerZoomOut = () => mapInstanceRef.current?.zoomOut(1);

  // Etiqueta del sensor orbital real activo según el nivel de zoom actual
  const sensorOrbitalActivo =
    nivelZoomActual >= 11
      ? "MRO HiRISE (curiosity_hirise_mosaic • 0.25m/px REAL)"
      : nivelZoomActual >= 6
      ? "MRO CTX (Gale_CTX_BlockAdj_dd • 5m/px REAL)"
      : "Viking MDIM 2.1 (Global • 232m/px REAL)";

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border-2 border-slate-700/90 bg-[#1a110b] shadow-inner">
      {/* Contenedor del Mapa Leaflet WMTS */}
      <div ref={mapContainerRef} className="z-10 h-full w-full" />

      {/* BARRA SUPERIOR FLOTANTE: ESCALAS SATELITALES Y SENSOR ORBITAL REAL ACTIVO */}
      <div className="pointer-events-auto absolute left-2.5 right-2.5 top-2.5 z-20 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-700/90 bg-slate-950/90 px-3 py-1.5 font-mono text-[10px] backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded border border-emerald-500/60 bg-emerald-950 px-1.5 py-0.5 font-black text-emerald-300">
            🛰️ {sensorOrbitalActivo}
          </span>
          <button
            type="button"
            onClick={irASectorBoxwork}
            className="rounded-lg border border-cyan-400/70 bg-cyan-500/20 px-2 py-0.5 font-bold text-white hover:bg-cyan-500/35 active:scale-95"
          >
            [📍 Sector Boxwork HiRISE (Z:14)]
          </button>
          <button
            type="button"
            onClick={irACraterGale}
            className="rounded-lg border border-slate-600 bg-slate-900 px-2 py-0.5 font-bold text-slate-200 hover:border-cyan-400 active:scale-95"
          >
            [🏔️ Mount Sharp CTX (Z:9)]
          </button>
          <button
            type="button"
            onClick={irAMarteGlobal}
            className="rounded-lg border border-slate-600 bg-slate-900 px-2 py-0.5 font-bold text-slate-200 hover:border-cyan-400 active:scale-95"
          >
            [🪐 Marte Global (Z:3)]
          </button>
          <button
            type="button"
            onClick={() => setMostrarSubcapaMolaColor(!mostrarSubcapaMolaColor)}
            className={`rounded-lg border px-2 py-0.5 font-bold transition-all ${
              mostrarSubcapaMolaColor
                ? "border-amber-400 bg-amber-500/25 text-amber-200"
                : "border-slate-700 bg-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            {mostrarSubcapaMolaColor ? "MOLA Color: ON" : "MOLA Color: OFF"}
          </button>
        </div>

        <span className="font-bold text-slate-300">
          LAT {coordenadasCursor.lat}°N • LON {coordenadasCursor.lon}°E • Z:{" "}
          {nivelZoomActual}
        </span>
      </div>

      {/* CONTROLES DE ZOOM (+/-) Y BRÚJULA ESTILO GOOGLE MAPS SATELITAL (DERECHA) */}
      <div className="pointer-events-auto absolute bottom-7 right-3 z-20 flex flex-col items-center gap-1.5 font-mono">
        <div
          title="Norte Planetocéntrico (EPSG:4326)"
          className="flex h-9 w-9 flex-col items-center justify-center rounded-full border border-slate-600 bg-slate-950/90 text-[10px] font-black text-cyan-300 shadow-lg"
        >
          <span className="leading-none text-rose-400">▲</span>
          <span className="leading-none">N</span>
        </div>

        <button
          type="button"
          onClick={hacerZoomIn}
          title="Acercar fotografía orbital HiRISE"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-600 bg-slate-950/90 text-base font-black text-white shadow-lg hover:border-cyan-400 active:scale-95"
        >
          +
        </button>
        <button
          type="button"
          onClick={hacerZoomOut}
          title="Alejar mapa satelital"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-600 bg-slate-950/90 text-base font-black text-white shadow-lg hover:border-cyan-400 active:scale-95"
        >
          −
        </button>
        <button
          type="button"
          onClick={irASectorBoxwork}
          title="Volver a centrar en ruta EVA"
          className="rounded-xl border border-cyan-500/60 bg-slate-950/90 px-2 py-1 text-[9px] font-bold text-cyan-300 shadow-lg hover:bg-slate-900"
        >
          Centrar ↺
        </button>
      </div>

      {/* LEYENDA INFERIOR IZQUIERDA DEL TRAZADO */}
      <div className="pointer-events-none absolute bottom-2.5 left-2.5 z-20 flex flex-wrap items-center gap-3 rounded-lg border border-slate-700/80 bg-slate-950/90 px-2.5 py-1 font-mono text-[10px] text-slate-200 backdrop-blur-sm">
        <span className="flex items-center gap-1.5 font-bold text-cyan-300">
          <span className="inline-block h-1.5 w-5 rounded bg-cyan-400" />
          Tramo EVA Boxwork
        </span>
        <span className="flex items-center gap-1.5 font-bold text-sky-300">
          <span className="inline-block h-1 w-5 border-b border-dashed border-sky-400" />
          Ruta Completa Curiosity (JPL)
        </span>
        <span className="flex items-center gap-1.5 font-bold text-amber-300">
          <span className="inline-block h-1.5 w-5 border border-dashed border-amber-400 bg-amber-400/20" />
          Desvío N4 (Simulado)
        </span>
        <span className="flex items-center gap-1.5 font-bold text-rose-300">
          <span className="inline-block h-2.5 w-2.5 rounded-full border border-rose-400 bg-rose-500/40" />
          Exclusión &gt;22°
        </span>
      </div>
    </div>
  );
}
