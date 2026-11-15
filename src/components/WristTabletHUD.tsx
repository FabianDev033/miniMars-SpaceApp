"use client";

import React, { useState } from "react";
import { DecisionEnginePanel } from "~/components/DecisionEnginePanel";
import { NodeAuditDrawer } from "~/components/NodeAuditDrawer";
import { TacticalMapCanvas } from "~/components/TacticalMapCanvas";
import { TopTelemetryBar } from "~/components/TopTelemetryBar";
import { api } from "~/trpc/react";
import type { MissionMode } from "~/types/mission";

export function WristTabletHUD() {
  const [mode, setMode] = useState<MissionMode>("conRover");
  const [includeDetour, setIncludeDetour] = useState<boolean>(false);
  const [simulateSolarAlert, setSimulateSolarAlert] = useState<boolean>(false);
  const [nodoSeleccionadoId, setNodoSeleccionadoId] = useState<string>(
    "nodo-3-ciencia-boxwork"
  );

  const missionDataQuery = api.mission.getMissionData.useQuery();
  const simQuery = api.mission.simulateMission.useQuery({
    mode,
    includeDetour,
    simulateSolarAlert,
  });

  if (missionDataQuery.isLoading || simQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060911] p-6 font-mono text-cyan-300">
        <div className="rounded-2xl border-2 border-cyan-500/40 bg-slate-900/90 px-8 py-6 text-center shadow-2xl">
          <p className="text-sm font-black uppercase tracking-widest text-cyan-400">
            INICIALIZANDO TABLET DE MUÑECA EVA // MOUNT SHARP (SECTOR BOXWORK)
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Cargando dataset local tipado (PIA26552, PIA26364, PIA26558,
            PIA26697) y motor tRPC...
          </p>
        </div>
      </div>
    );
  }

  const data = missionDataQuery.data;
  const sim = simQuery.data;

  if (!data || !sim) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060911] p-6 font-mono text-rose-300">
        Error al cargar `trpc.mission.getMissionData` o `simulateMission`.
      </div>
    );
  }

  const nodoActual =
    data.nodos.find((n) => n.id === nodoSeleccionadoId) ?? data.nodos[0]!;

  const handleToggleDetour = () => {
    const next = !includeDetour;
    setIncludeDetour(next);
    if (next) {
      setNodoSeleccionadoId("nodo-4-desvio-nodulos");
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#05080f] p-2 sm:p-3 text-slate-100 select-none">
      {/* CHASIS DE TABLET DE MUÑECA 16:9 CON BISEL TÁCTICO Y BOTONES LATERALES PARA GUANTES */}
      <div className="relative flex w-full max-w-[1640px] lg:aspect-video flex-col justify-between overflow-hidden rounded-[28px] border-4 border-slate-700/90 bg-gradient-to-br from-slate-950 via-[#0a111e] to-slate-950 p-3 sm:p-4 shadow-[0_0_70px_rgba(6,182,212,0.18)]">
        {/* 1. BARRA SUPERIOR DE TELEMETRÍA Y ESCENARIO (CAPA 4.2 - SEGURIDAD Y SUPERVIVENCIA) */}
        <TopTelemetryBar
          mode={mode}
          onChangeMode={setMode}
          includeDetour={includeDetour}
          onToggleDetour={handleToggleDetour}
          simulateSolarAlert={simulateSolarAlert}
          onToggleSolarAlert={() => setSimulateSolarAlert((prev) => !prev)}
          simulation={sim}
          parametros={data.parametros}
        />

        {/* 2. CUERPO CENTRAL: LIENZO DEL MAPA (IZQUIERDA) + AUDITORÍA CIENTÍFICA Y VISOR POV HUD (DERECHA) */}
        <div className="my-2 grid flex-1 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-12">
          {/* Columna Izquierda (7 cols): Lienzo Central del Mapa y Trazado de Ruta (Capas 4.1, 4.2 y 4.3) */}
          <div className="flex flex-col overflow-hidden lg:col-span-7">
            <TacticalMapCanvas
              nodos={data.nodos}
              nodoSeleccionadoId={nodoActual.id}
              onSelectNodo={setNodoSeleccionadoId}
              includeDetour={includeDetour}
              simulation={sim}
            />
          </div>

          {/* Columna Derecha (5 cols): Panel Desplegable de Auditoría Científica y Visor POV (HUD) */}
          <aside className="flex flex-col overflow-hidden rounded-2xl border-2 border-slate-800 bg-slate-900/80 p-3 lg:col-span-5">
            <NodeAuditDrawer
              nodo={nodoActual}
              nodos={data.nodos}
              onSelectNodo={setNodoSeleccionadoId}
            />
          </aside>
        </div>

        {/* 3. PANEL INFERIOR: DICTAMEN DEL MOTOR DE DECISIONES (REGLA DE 4 PASOS) */}
        <DecisionEnginePanel
          mode={mode}
          evaluacionDesvio={sim.evaluacionDesvio}
        />
      </div>
    </div>
  );
}
