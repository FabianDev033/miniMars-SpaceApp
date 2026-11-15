"use client";

import React, { useState } from "react";
import {
  calcularEstadoEtapaEva,
  EvaSequencePlayer,
} from "~/components/EvaSequencePlayer";
import { NodeAuditDrawer } from "~/components/NodeAuditDrawer";
import { ScientificAuditModal } from "~/components/ScientificAuditModal";
import { TacticalMapCanvas } from "~/components/TacticalMapCanvas";
import { TopTelemetryBar } from "~/components/TopTelemetryBar";
import { api } from "~/trpc/react";
import type { MissionMode } from "~/types/mission";

export function WristTabletHUD() {
  const [mode, setMode] = useState<MissionMode>("conRover");
  const [includeDetour, setIncludeDetour] = useState<boolean>(false);
  const [simulateSolarAlert, setSimulateSolarAlert] = useState<boolean>(false);
  const [etapaActual, setEtapaActual] = useState<number>(1);
  const [nodoSeleccionadoId, setNodoSeleccionadoId] = useState<string>(
    "nodo-1-inicio-seguro"
  );
  const [modalAuditoriaAbierto, setModalAuditoriaAbierto] =
    useState<boolean>(false);

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

  const estadoEtapa = calcularEstadoEtapaEva({
    etapa: etapaActual,
    mode,
    includeDetour,
    simulateSolarAlert,
    parametros: data.parametros,
    simulation: sim,
  });

  const nodoActual =
    data.nodos.find((n) => n.id === nodoSeleccionadoId) ?? data.nodos[0]!;

  const handleChangeEtapa = (nuevaEtapa: number) => {
    setEtapaActual(nuevaEtapa);
    const infoEtapa = calcularEstadoEtapaEva({
      etapa: nuevaEtapa,
      mode,
      includeDetour,
      simulateSolarAlert,
      parametros: data.parametros,
      simulation: sim,
    });
    setNodoSeleccionadoId(infoEtapa.nodoFocoId);
  };

  const handleToggleDetour = () => {
    const next = !includeDetour;
    setIncludeDetour(next);
    if (next) {
      setNodoSeleccionadoId("nodo-4-desvio-nodulos");
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-[#0d0d10] p-2 text-slate-100 sm:p-4 select-none">
      {/* CHASIS DE TABLET DE MUÑECA 16:9 CON BISEL TÁCTICO Y BOTONES GRANDES PARA GUANTES */}
      <div className="relative flex w-full max-w-[2200px] flex-1 flex-col gap-3 overflow-hidden bg-[#0d0d10] p-1 sm:p-2">
        {/* 1. BARRA SUPERIOR DE TELEMETRÍA Y ESCENARIO (CAPA 4.2 - SEGURIDAD Y SUPERVIVENCIA) */}
        <TopTelemetryBar
          mode={mode}
          includeDetour={includeDetour}
          onToggleDetour={handleToggleDetour}
          simulateSolarAlert={simulateSolarAlert}
          onToggleSolarAlert={() => setSimulateSolarAlert((prev) => !prev)}
          onOpenScientificAudit={() => setModalAuditoriaAbierto(true)}
          simulation={sim}
          evaluacionDesvio={sim.evaluacionDesvio}
          parametros={data.parametros}
        >
          {/* Controles de etapa y estado acumulado de la EVA */}
          <EvaSequencePlayer
            etapaActual={etapaActual}
            onChangeEtapa={handleChangeEtapa}
            estadoEtapa={estadoEtapa}
            mode={mode}
            onChangeMode={setMode}
            includeDetour={includeDetour}
            onToggleDetour={handleToggleDetour}
            simulation={sim}
          />
        </TopTelemetryBar>

        {/* 3. CUERPO CENTRAL: LIENZO DEL MAPA + PERFIL TOPOGRÁFICO (IZQUIERDA) Y AUDITORÍA + VISOR POV HUD (DERECHA) */}
        <div className="grid flex-1 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-12">
          {/* Columna Izquierda (7 cols): Mapa Multicapa + Marcador Animado EVA/Rover + Perfil de Elevación MOLA */}
          <div className="flex min-h-[420px] flex-col overflow-hidden lg:col-span-8">
            <TacticalMapCanvas
              nodos={data.nodos}
              nodoSeleccionadoId={nodoActual.id}
              onSelectNodo={setNodoSeleccionadoId}
              includeDetour={includeDetour}
              simulation={sim}
              mode={mode}
              estadoEtapa={estadoEtapa}
            />
          </div>

          {/* Columna Derecha (5 cols): Panel Desplegable de Auditoría Científica y Visor POV (HUD) */}
          <aside className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#0d0d10] p-3 lg:col-span-4">
            <NodeAuditDrawer
              nodo={nodoActual}
              nodos={data.nodos}
              onSelectNodo={setNodoSeleccionadoId}
            />
          </aside>
        </div>

        {/* 4. MODAL DE DOCUMENTACIÓN Y TRANSPARENCIA CIENTÍFICA INTEGRADA (FASE 4) */}
        <ScientificAuditModal
          abierto={modalAuditoriaAbierto}
          onCerrar={() => setModalAuditoriaAbierto(false)}
          nodos={data.nodos}
          parametros={data.parametros}
        />
      </div>
    </div>
  );
}
