/**
 * MODELOS DE DATOS ESTRICTOS — FASE 1 (STACK T3)
 * NASA Space Apps Challenge — Guía de Supervivencia Interplanetaria
 * Sector Boxwork, Mount Sharp (Cráter Gale, Marte)
 */

export type DataOrigin = "medido" | "derivado" | "simulado";

export type MissionMode = "solo" | "conRover";

export type WaypointNodeType =
  | "inicio_seguro"
  | "punto_ruta"
  | "parada_cientifica"
  | "obstaculo_exclusion"
  | "desvio_simulado";

export type RiskLevel = "bajo" | "medio" | "alto";

/**
 * Registro de telemetría con trazabilidad obligatoria (Regla de Oro #2 y #3).
 * Si un punto de ruta no tiene cobertura real del sensor, `valor` es `null`
 * y `notaCobertura` explica la ausencia sin extrapolar en silencio.
 */
export interface TelemetryRecord {
  id: string;
  nombre: string;
  valor: number | string | null;
  unidad: string;
  ubicacion: string;
  fechaOSol: string;
  instrumento: string;
  fuenteUrl: string;
  clasificacion: DataOrigin;
  notaCobertura?: string;
}

export interface WaypointCoordinates {
  xPercent: number;
  yPercent: number;
  lat: number;
  lon: number;
  elevacionM: number;
}

export interface StopDuration {
  solo: number;
  conRover: number;
}

export interface SegmentRisk {
  nivel: RiskLevel;
  pendienteGrados: number;
  clasificacion: "simulado" | "derivado";
  motivo: string;
}

export interface PovImageMetadata {
  codigoPia: string;
  titulo: string;
  archivoLocal: string;
  camara: string;
  sol: string;
  descripcionHud: string;
}

export interface WaypointLayers {
  movilidadTerreno: TelemetryRecord[];
  seguridadSupervivencia: TelemetryRecord[];
  interesCientifico: TelemetryRecord[];
}

/**
 * Representa cada nodo del recorrido en Mount Sharp.
 */
export interface WaypointNode {
  id: string;
  orden: number;
  nombre: string;
  tipo: WaypointNodeType;
  coordenadasMapa: WaypointCoordinates;
  /** true para el tramo real recorrido por Curiosity en boxwork; false para el desvío simulado */
  esRutaHistoricaCuriosity: boolean;
  duracionParadaMin: StopDuration;
  riesgoTramo: SegmentRisk;
  imagenPov: PovImageMetadata;
  capas: WaypointLayers;
}

/**
 * Parámetros base explícitos de simulación EVA + Rover.
 */
export interface MissionSimulationParameters {
  tasaOxigenoKgHora: number;
  capacidadInicialO2Kg: number;
  reservaMinimaO2Porcentaje: number;
  energiaInicialRoverPorcentaje: number;
  reservaMinimaRoverPorcentaje: number;
  velocidadCaminataKmHora: number;
  tiempoTramoIdaBaseMin: number;
  tiempoTramoRegresoBaseMin: number;
  tiempoAdicionalDesvioIdaRegresoMin: number;
  consumoRoverRutaBasePorcentaje: number;
  consumoRoverParadaCientifica1Porcentaje: number;
  consumoRoverDesvioAdicionalPorcentaje: number;
  penalizacionAlertaSolarMin: number;
  metadatosParametros: TelemetryRecord[];
}

/**
 * Evaluación de la regla de 4 pasos para desvíos (Fase 3 de la Guía).
 */
export interface DetourEvaluationResult {
  paso1ViabilidadReserva: {
    aprobado: boolean;
    oxigenoProyectadoConDesvioPorcentaje: number;
    energiaRoverProyectadaConDesvioPorcentaje: number;
    detalle: string;
  };
  paso2ExclusionRiesgoAlto: {
    aprobado: boolean;
    nodosExcluidosPorPendiente: string[];
    detalle: string;
  };
  paso3ComparacionCienciaCosto: {
    beneficioCientifico: string;
    tiempoAdicionalMin: number;
    oxigenoAdicionalKg: number;
    energiaRoverAdicionalPorcentaje: number;
    detalle: string;
  };
  paso4ExplicacionTransparente: {
    recomendado: boolean;
    resumenEjecutivo: string;
    justificacionCompleta: string;
  };
}

/**
 * Resultado completo devuelto por `simulateMission`.
 */
export interface MissionSimulationResult {
  mode: MissionMode;
  includeDetour: boolean;
  simulateSolarAlert: boolean;
  desgloseTiempoMin: {
    idaMin: number;
    paradasCientificasMin: number;
    regresoMin: number;
    penalizacionSolarMin: number;
    tiempoTotalEvaMin: number;
  };
  oxigeno: {
    capacidadInicialKg: number;
    oxigenoUsadoKg: number;
    oxigenoRestanteKg: number;
    oxigenoRestantePorcentaje: number;
    reservaMinimaPorcentaje: number;
    perforaReserva25: boolean;
  };
  rover: {
    acompanando: boolean;
    energiaInicialPorcentaje: number;
    energiaRoverUsadaPorcentaje: number;
    energiaRoverRestantePorcentaje: number;
    reservaMinimaRoverPorcentaje: number;
    bajoReservaRover: boolean;
    funcionExplicita: string;
  };
  estadoMision: {
    esExitosa: boolean;
    nivelAlerta: "nominal" | "precaucion" | "critica";
    mensajeAlertaPrincipal: string | null;
    alertasSecundarias: string[];
  };
  evaluacionDesvio: DetourEvaluationResult;
}
