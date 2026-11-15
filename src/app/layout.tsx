import "leaflet/dist/leaflet.css";
import "~/styles/globals.css";
import { type Metadata } from "next";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "EVA Wrist-Pad | Mount Sharp Boxwork Sector — NASA Space Apps",
  description:
    "Simulador interactivo de Tablet de Muñeca para Supervivencia Interplanetaria en el sector Boxwork de Mount Sharp (Cráter Gale, Marte) con datos históricos de Curiosity y API WMTS de NASA Mars Trek.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased selection:bg-cyan-500 selection:text-slate-950">
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
