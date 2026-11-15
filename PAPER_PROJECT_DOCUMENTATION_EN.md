# MiniMars: Tactical Decision-Support and Interplanetary Survival System in the Mount Sharp Boxwork Sector (Gale Crater, Mars)

**Challenge Category:** NASA Space Apps Challenge — *Interplanetary Survival Guide*  
**Team Members:** Jorge Geronimo Agüero López, Marcos Gabriel Coloma Muños, and Fabian Barzola  
**Geographic Study Area:** Aeolis Mons (*Mount Sharp*), *Boxwork* Ridge Sector, Gale Crater, Mars ($\text{Lat. } -4.6805^\circ\text{ to } -4.6854^\circ\text{ N}, \text{Lon. } 137.3612^\circ\text{ to } 137.3668^\circ\text{ E}$)  
**System Architecture:** T3 Stack (`Next.js 15`, Strict `TypeScript 5.7`, `tRPC v11`, `Tailwind CSS`, `Leaflet OGC WMTS`)  
**Methodological Scope:** Deterministic Extravehicular Activity (EVA) planning and scientific data-traceability simulator grounded in historical *Mars Science Laboratory* (MSL *Curiosity*) telemetry and explicit Portable Life Support System (PLSS) baseline models.

---

## 1. Project Name & Team Members

**Official Project Name:**  
> **MiniMars** *(Mount Sharp Boxwork Sector — Interplanetary Survival & Decision Support System)*  
*(Repository Identifier: `miniMars-SpaceApp`)*

**Official Submission Links:**
- **Live Deployed Application:** [https://minimars-one.vercel.app/](https://minimars-one.vercel.app/)
- **Official Jury Presentation (Canva):** [https://canva.link/l8yflme9lywr6ha](https://canva.link/l8yflme9lywr6ha)

**Team Members:**
- **Jorge Geronimo Agüero López**
- **Marcos Gabriel Coloma Muños**
- **Fabian Barzola**

---

## 2. Executive Summary (*Abstract*)

Transitioning from robotic surface reconnaissance to future crewed expeditions on Mars requires real-time operational decision-support architectures capable of simultaneously synthesizing orbital topography, in-situ environmental telemetry, geological science value, and life-critical Portable Life Support System (PLSS) constraints. **MiniMars** is an interactive web application that emulates a **tactical astronaut wrist-mounted tablet** operating across the polygonal mineral ridge (*Boxwork*) formations of **Mount Sharp (Aeolis Mons)** within **Gale Crater**.

Unlike passive cartographic viewers or gamified simulations that silently interpolate missing planetary measurements, **MiniMars** enforces a **strict epistemological and scientific data-honesty framework**. The platform fuses the official multi-resolution orbital imagery pyramid from **NASA Mars Trek OGC WMTS** (Viking MDIM 2.1, MRO CTX at $5\text{ m/px}$, MRO HiRISE at $0.25\text{ m/px}$, MGS MOLA laser altimetry, and Mars Odyssey THEMIS IR thermal inertia) with verifiable historical surface records collected by the **MSL Curiosity** rover (RAD, REMS, ChemCam, MAHLI, APXS, and Mastcam instruments across Sols 4189–4844). Built upon this empirical foundation, a deterministic **tRPC and TypeScript** computation engine evaluates two operational paradigms—**Solo Astronaut** versus **Astronaut Accompanied by a Support Rover**—governed by an explicit metabolic oxygen consumption model ($0.076\text{ kg O}_2/\text{h}$, derived from *NASA BVAD*) and a **4-Step Detour Decision Rule** in which biomechanical slope limits ($>22^\circ$) and mandatory return life-support reserves ($\ge 25\%\text{ O}_2$) function as non-negotiable safety filters prior to scientific optimization.

---

## 3. What Did We Develop? (*System Architecture & Technical Implementation*)

We engineered an end-to-end EVA planning, sequential mission playback, and scientific auditing platform designed around the ergonomics of a **16:9 panoramic wrist-mounted Heads-Up Display (HUD)** ([WristTabletHUD.tsx](file:///c:/Users/angel/OneDrive/Documentos/GitHub/miniMars-SpaceApp/src/components/WristTabletHUD.tsx)), featuring high-contrast tactile controls optimized for pressurized EVA gloves. The system comprises four core technical and scientific pillars:

### 3.1. Multi-Layered Orbital Cartographic Engine (NASA Mars Trek OGC WMTS)
We implemented a live geospatial engine in [MarsTrekLeafletMap.tsx](file:///c:/Users/angel/OneDrive/Documentos/GitHub/miniMars-SpaceApp/src/components/MarsTrekLeafletMap.tsx) coupled with [TacticalMapCanvas.tsx](file:///c:/Users/angel/OneDrive/Documentos/GitHub/miniMars-SpaceApp/src/components/TacticalMapCanvas.tsx) using an Equirectangular projection (`EPSG:4326`) that streams official **NASA/JPL Solar System Treks** web map tile services:
1. **Layer 4.1 — Mobility & Terrain:** Integrates the orbital resolution pyramid (Viking $232\text{ m/px} \rightarrow$ CTX $5\text{ m/px} \rightarrow$ HiRISE $0.25\text{ m/px}$), the **MGS MOLA** digital elevation model, *Curiosity*'s actual historical traverse polyline, and an interactive longitudinal topographic profile ([ElevationProfile.tsx](file:///c:/Users/angel/OneDrive/Documentos/GitHub/miniMars-SpaceApp/src/components/ElevationProfile.tsx)) spanning $-3922\text{ m}$ to $-3887\text{ m}$ relative to the MOLA datum.
2. **Layer 4.2 — Safety & Survival:** Overlays topographic hazard rings, critical slope exclusion thresholds ($>22^\circ$), and point-specific Galactic Cosmic Ray (**MSL RAD**, in $\text{mSv/sol}$) and meteorological (**MSL REMS**, barometric pressure in $\text{Pa}$ and air/ground temperatures in $^\circ\text{C}$) telemetry.
3. **Layer 4.3 — Scientific Interest & Thermal Inertia:** Renders the **Mars Odyssey THEMIS Day IR ($100\text{ m}$)** controlled mosaic alongside geochemical sampling waypoints documented via **ChemCam (LIBS)** laser spectroscopy and **MAHLI** microscopic imaging.

### 3.2. Four-Node Geological Traverse & First-Person Curiosity POV HUD
The mission dataset in [boxwork_mission.ts](file:///c:/Users/angel/OneDrive/Documentos/GitHub/miniMars-SpaceApp/src/data/boxwork_mission.ts) models four strategic waypoints anchored to authentic surface imagery from the **NASA/JPL Photojournal**:
- **Node 1 (`PIA26552`, Sol 4476 — Safe Threshold / Base Ingress):** Entry terrace to the *Boxwork* unit ($\text{elevation } -3922\text{ m}$, local slope $6.4^\circ$, GCR dose $0.63\text{ mSv/sol}$, ambient pressure $844\text{ Pa}$, diurnal air temperature $-23.8^\circ\text{C}$). Serves as the mandatory EVA departure and return point.
- **Node 2 (`PIA26364`, Sol 4189 — High-Risk Exclusion Talus):** Steep fractured outcrop exhibiting a $24.5^\circ$ slope ($>22^\circ$) and sharp decametric angular blocks. Automatically locked by the biomechanical safety filter to prevent pressurized boot slippage, suit fabric abrasion, or rover traction loss.
- **Node 3 (`PIA26558`, Sol 4541 — Science Stop 1 / Historical Curiosity Route):** Polygonal network of *Boxwork* mineral ridges cemented by ancient subsurface groundwater fluids (calcium sulfate veins verified by ChemCam LIBS, approach slope $7.5^\circ$, GCR dose $0.65\text{ mSv/sol}$, ground temperature $-14.2^\circ\text{C}$).
- **Node 4 (`PIA26697`, Sol 4636 — Science Stop 2 / Simulated Detour on Real Cartography):** Simulated EVA extension over real HiRISE orthomosaics ($\text{slope } 11.8^\circ$) targeting millimeter-scale evaporitic nodules and late-stage diagenetic textures documented by the MAHLI microscopic camera.

### 3.3. Deterministic EVA Survival & Resource Engine (tRPC Backend)
The `simulateMission` procedure in [mission.ts](file:///c:/Users/angel/OneDrive/Documentos/GitHub/miniMars-SpaceApp/src/server/api/routers/mission.ts) computes real-time oxygen mass balance, cumulative EVA duration, and robotic battery depletion using explicit governing equations:

$$\text{Total EVA Time (min)} = t_{\text{outbound}} + \sum t_{\text{science stops}}(\text{mode}) + t_{\text{return}} + t_{\text{solar contingency}}$$

$$\text{O}_2\text{ Consumed (kg)} = \left(\frac{\text{Total EVA Time}}{60}\right) \times \dot{m}_{\text{O}_2}, \quad \text{where } \dot{m}_{\text{O}_2} = 0.076\text{ kg/h}$$

$$\text{Remaining O}_2\text{ (\%)} = \left(\frac{M_{\text{O}_2,\text{initial}} - \text{O}_2\text{ Consumed}}{M_{\text{O}_2,\text{initial}}}\right) \times 100, \quad \text{with } M_{\text{O}_2,\text{initial}} = 0.380\text{ kg } (5.0\text{ h autonomy})$$

In both operational modes, the astronaut walks the entire traverse at a constant speed of $0.45\text{ km/h}$ ($t_{\text{outbound base}} = 80\text{ min}$, $t_{\text{return base}} = 80\text{ min}$, plus $+25\text{ min}$ of round-trip walking if the Node 4 detour is engaged). Rather than assuming the rover carries the astronaut, our model defines an **explicit robotic support function**: the companion rover transports geological tools/samples and performs optical pre-scanning of outcrops, compressing Science Stop 1 from $30\text{ min}$ to $15\text{ min}$ and Science Stop 2 (Detour) from $40\text{ min}$ to $15\text{ min}$, at the cost of expending **Rover Battery Energy (%)** ($\text{minimum safety reserve } \ge 20\%$).

### 3.4. Scientific Data-Honesty Matrix & Strict Epistemological Traceability
Through [NodeAuditDrawer.tsx](file:///c:/Users/angel/OneDrive/Documentos/GitHub/miniMars-SpaceApp/src/components/NodeAuditDrawer.tsx) and the integrated [ScientificAuditModal.tsx](file:///c:/Users/angel/OneDrive/Documentos/GitHub/miniMars-SpaceApp/src/components/ScientificAuditModal.tsx), every telemetry variable is strictly typed via the `TelemetryRecord` interface ([mission.ts](file:///c:/Users/angel/OneDrive/Documentos/GitHub/miniMars-SpaceApp/src/types/mission.ts)), storing value, unit, Martian Sol, instrument, official URL, and a mandatory tripartite provenance badge:
- **`[MEASURED]` (`medido`):** Direct empirical in-situ readings acquired by *Curiosity* payload instruments (RAD, REMS, ChemCam, MAHLI, Mastcam).
- **`[DERIVED]` (`derivado`):** Physical quantities computed from orbital Digital Elevation Models (MOLA / HiRISE DEM) or published NASA life-support baseline assumptions (*NASA BVAD*).
- **`[SIMULATED]` (`simulado`):** Explicit prototype rules (PLSS tank capacity of $0.38\text{ kg}$, $25\%$ minimum $\text{O}_2$ reserve threshold, simulated detour geometry to Node 4).
- **Explicit Null Coverage (`valor: null`):** Wherever an instrument lacks valid coverage at a specific location or Sol (e.g., REMS wind sensor unavailability on Sol 4541 or absence of stationary RAD measurements atop the untraversed $24.5^\circ$ talus at Node 2), the system explicitly flags the record as null coverage and **strictly prohibits silent spatial interpolation**.

---

## 4. How Does It Address the Challenge? (*Alignment with the NASA Space Apps Challenge*)

The **Interplanetary Survival Guide** challenge calls for an interactive tool that empowers future human explorers on Mars to interpret complex planetary datasets, balance environmental hazards against terrain constraints and scientific targets, and make life-preserving operational decisions. **MiniMars** directly fulfills every dimension of the challenge through two primary mechanisms:

### 4.1. Operational Synthesis of the Three Survival Layers
Rather than isolating planetary datasets into disconnected charts, our interface unifies the three decision layers required during an EVA:
1. **Terrain & Mobility:** Distinguishes safe sulfate-terrace corridors ($<8^\circ$) from hazardous geomorphological barriers ($>22^\circ$ at Node 2).
2. **Safety & Environment:** Tracks Galactic Cosmic Ray exposure ($\sim 0.63\text{--}0.65\text{ mSv/sol}$), extreme diurnal thermal gradients, and the life-support penalty of solar particle contingency protocols ($+20\text{ min}$ shelter delay).
3. **Scientific Return:** Maps every minute of oxygen expenditure to concrete astrobiological and hydrological evidence on Mount Sharp—contrasting early groundwater calcium-sulfate veins at Node 3 (`PIA26558`) against late-stage evaporitic nodules at Node 4 (`PIA26697`).

### 4.2. The 4-Step Detour Decision Engine ([DecisionEnginePanel.tsx](file:///c:/Users/angel/OneDrive/Documentos/GitHub/miniMars-SpaceApp/src/components/DecisionEnginePanel.tsx))
Our application resolves the central operational dilemma of planetary field geology—**should the crew detour for a high-priority scientific sample or return immediately to base?**—via a transparent, four-stage algorithmic filter:
- **Step 1 (Reserve Viability Check):** Verifies that projected return oxygen at Node 1 remains $\ge 25\%$ and rover battery remains $\ge 20\%$.
- **Step 2 (High-Risk Slope Exclusion):** Permanently rejects any path intersecting Node 2 ($24.5^\circ > 22^\circ$).
- **Step 3 (Science vs. Resource Cost Trade-off):** Quantifies the marginal time, $\text{O}_2$ mass, and robotic energy cost of adding Node 4.
- **Step 4 (Transparent Scenario Verdict):** Demonstrates mathematically how human-robotic teaming shifts mission viability:

| Operational Mode | Selected Traverse | Total EVA Time | $\text{O}_2$ Consumed ($\text{kg}$) | Remaining $\text{O}_2$ at Return | Remaining Rover Battery | Survival Engine Verdict |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **Solo Astronaut** | Base Route (N1 $\rightarrow$ N3 $\rightarrow$ N1) | $190\text{ min}$ | $0.2407\text{ kg}$ | **$36.7\%$** ($\ge 25\%$) | N/A (At Base) | **NOMINAL / MISSION VIABLE** |
| **Solo Astronaut** | With Detour (N1 $\rightarrow$ N3 $\rightarrow$ N4 $\rightarrow$ N1) | $255\text{ min}$ | $0.3230\text{ kg}$ | **$15.0\%$** ($< 25\%$) | N/A (At Base) | **DETOUR REJECTED (Red Alert: Breaches 25% Reserve)** |
| **With Support Rover** | Base Route (N1 $\rightarrow$ N3 $\rightarrow$ N1) | $175\text{ min}$ | $0.2217\text{ kg}$ | **$41.7\%$** ($\ge 25\%$) | **$56.0\%$** ($\ge 20\%$) | **NOMINAL / OPTIMAL MARGIN** |
| **With Support Rover** | With Detour (N1 $\rightarrow$ N3 $\rightarrow$ N4 $\rightarrow$ N1) | $215\text{ min}$ | $0.2723\text{ kg}$ | **$28.3\%$** ($\ge 25\%$) | **$32.0\%$** ($\ge 20\%$) | **DETOUR APPROVED (Extra Science Within Safe Reserve)** |

---

## 5. Why Is It Important? (*Scientific, Operational & Educational Impact*)

**MiniMars** advances the state of planetary exploration tools across three critical dimensions:

### 5.1. Paradigm Shift: Quantifying Human-Robotic Synergy on the Martian Surface
For over a decade, *Curiosity* has explored Gale Crater autonomously at meter-scale daily drives. When human explorers arrive on Mars, they will operate under strict metabolic consumables ($\sim 0.076\text{ kg O}_2/\text{h}$) and radiation ceilings. Our work proves quantitatively that **a companion rover does not need to transport the astronaut physically to be life-saving**: by acting as a **scientific force multiplier** (pre-scanning targets and carrying sampling payloads), the rover compresses stationary field-work duration enough to unlock high-value geological detours (Node 4) while preserving the astronaut's $25\%$ emergency oxygen reserve.

### 5.2. Epistemological Integrity Against Cartographic "Hallucination"
A pervasive flaw in public-facing space simulators is presenting continuous, fabricated heatmaps over regions where spacecraft never collected data, blurring the line between empirical NASA measurements and software assumptions. **MiniMars** establishes a **Safety-First and Honesty-First Architecture**:
- It educates users that real planetary datasets are **discrete, asynchronous across Martian Sols, and subject to sensor limitations** (such as REMS anemometer gaps or untraversed steep talus slopes).
- It enforces the operational rule that **safety is a prerequisite filter, never a variable that can be traded away for higher scientific reward**.

### 5.3. Democratizing NASA Planetary Archives (PDS, Mars Trek, and BVAD)
Primary NASA repositories—such as the *Planetary Data System* (PDS Geosciences and Atmospheres nodes), OGC WMTS orbital services, and the *Baseline Values and Assumptions Document (BVAD)*—are often inaccessible to students, mission designers, and the general public due to their fragmented formats. **MiniMars** translates these research-grade archives into an intuitive, first-person tactical experience on Mount Sharp, enabling anyone to understand why the *Boxwork* mineral ridges are vital to decoding the history of liquid water on Mars and how data-driven engineering will keep future astronauts alive.

---

## 6. Official NASA References & Data Sources

1. **NASA Life Support Baseline Values and Assumptions Document (BVAD, 2022):** Reference magnitude for closed-loop metabolic oxygen consumption ($0.076\text{ kg/h}$). [NASA NTRS — BVAD 20210024855](https://ntrs.nasa.gov/api/citations/20210024855/downloads/BVAD_2.15.22-final.pdf)
2. **NASA/JPL Mars Trek OGC WMTS & API:** Orbital imagery mosaics including Viking MDIM 2.1, MRO CTX ($5\text{ m/px}$), MRO HiRISE ($0.25\text{ m/px}$), MGS MOLA altimetry, and Mars Odyssey THEMIS Day IR ($100\text{ m}$). [Mars Trek API Documentation](https://trek.nasa.gov/tiles/apidoc/trekAPI.html?body=mars)
3. **NASA Mars Trek — Curiosity Path MapServer:** Historical polyline geometry of MSL *Curiosity*'s ascent up Aeolis Mons. [Curiosity Path REST Service](https://trek.nasa.gov/mars/trekarcgis/rest/services/curiosity_path/MapServer/0)
4. **PDS Atmospheres Node — MSL REMS Archive:** Point meteorological records for barometric pressure ($\text{Pa}$) and air/ground temperatures ($^\circ\text{C}$). [PDS REMS Archive](https://pdsatmospheres.nmsu.edu/data_and_services/atmospheres_data/MARS/curiosity/rems.html)
5. **PDS Geosciences Node — Mars Science Laboratory (MSL) Archive:** Galactic Cosmic Ray (GCR) radiation dose rates from the RAD detector and geochemical spectroscopy from ChemCam/APXS. [PDS Geosciences MSL](https://pds-geosciences.wustl.edu/missions/msl/)
6. **NASA Science — Curiosity Mission Updates (Sols 4838–4844):** Operational and geological context for the polygonal *Boxwork* ridge campaign on Mount Sharp. [NASA Curiosity Boxwork Blog](https://science.nasa.gov/blog/curiosity-blog-sols-4838-4844-wrapping-up-the-boxwork-terrain/)
7. **NASA/JPL Photojournal & MSL Raw Images (`PIA26552`, `PIA26364`, `PIA26558`, `PIA26697`):** Authentic Mastcam and MAHLI surface photographs linked to each waypoint HUD. [MSL Raw Images Catalog](https://mars.nasa.gov/msl/multimedia/raw-images/)
8. **USGS Scientific Investigations Map 3292:** Global geologic map and stratigraphic context of Mars. [USGS SIM 3292](https://pubs.usgs.gov/sim/3292/)

---

## 7. Artificial Intelligence Usage & Transparency Disclosure

In full compliance with the **NASA Space Apps Challenge** guidelines on transparency and academic integrity, the team declares the use of conversational Artificial Intelligence assistants as collaborative engineering and documentation support tools during the development lifecycle:

- **Google AI Ecosystem (Gemini):** Assisted with T3 Stack (`Next.js`, `TypeScript`, `tRPC`) software architecture, tactical HUD component layout, and technical paper structuring.
- **OpenAI ChatGPT (Model 6 Luna):** Assisted with conceptual synthesis of EVA operational scenarios, edge-case brainstorming, and mission workflow organization.
- **Anthropic Claude (Model Claude Sonnet 5.5):** Assisted with strict TypeScript interface refactoring (`TelemetryRecord`), deterministic tRPC router logic review, and academic prose editing.

**Scientific Integrity Guarantee:** No planetary science telemetry, orbital cartography, surface photography (`PIA26552`, `PIA26364`, `PIA26558`, `PIA26697`), or life-support baseline constants (*NASA BVAD*, *Mars Trek WMTS*, *PDS REMS/RAD*) were synthetically fabricated by AI. Every scientific record was sourced from official NASA repositories, manually verified by the human team, and locked under our strict tripartite provenance schema (`[MEASURED]`, `[DERIVED]`, `[SIMULATED]`, and explicit `null` coverage declarations).

