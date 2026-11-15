# MiniMars: Sistema Táctico de Soporte a Decisiones y Supervivencia Interplanetaria en el Sector Boxwork de Mount Sharp (Cráter Gale, Marte)

**Categoría / Desafío:** NASA Space Apps Challenge — *Guía de Supervivencia Interplanetaria (Interplanetary Survival Guide)*  
**Integrantes del Equipo:** Jorge Geronimo Agüero López, Marcos Gabriel Coloma Muños y Fabian Barzola  
**Escenario Geográfico de Estudio:** Aeolis Mons (*Mount Sharp*), Sector *Boxwork*, Cráter Gale, Marte ($\text{Lat. } -4.6805^\circ\text{ a } -4.6854^\circ\text{ N}, \text{Lon. } 137.3612^\circ\text{ a } 137.3668^\circ\text{ E}$)  
**Arquitectura Tecnológica:** Stack T3 (`Next.js 15`, `TypeScript 5.7` Estricto, `tRPC v11`, `Tailwind CSS`, `Leaflet OGC WMTS`)  
**Naturaleza Metodológica:** Prototipo determinista de planificación y auditoría de Actividades Extravehiculares (EVA) basado en telemetría histórica de la misión *Mars Science Laboratory* (MSL *Curiosity*) y modelos explícitos de soporte vital.

---

## 1. Nombre del Proyecto e Integrantes

**Nombre Oficial del Proyecto:**  
> **MiniMars** *(Mount Sharp Boxwork Sector — Interplanetary Survival & Decision Support System)*  
*(Repositorio: `miniMars-SpaceApp`)*

**Integrantes del Equipo:**
- **Jorge Geronimo Agüero López**
- **Marcos Gabriel Coloma Muños**
- **Fabian Barzola**

---

## 2. Resumen General del Proyecto (*Abstract*)

La transición desde la exploración robótica hacia futuras misiones humanas en la superficie de Marte exige sistemas de soporte a la toma de decisiones en tiempo real que integren simultáneamente topografía orbital, telemetría ambiental in-situ, valor científico geológico y restricciones críticas de soporte vital portátil (*Portable Life Support System*, PLSS). **MiniMars** es una aplicación web interactiva que simula la interfaz táctica de una **tablet de muñeca para astronautas** operando en el sector de crestas minerales poligonales (*Boxwork*) de **Mount Sharp (Aeolis Mons)**, dentro del **Cráter Gale**.

A diferencia de los visualizadores cartográficos pasivos o las simulaciones gamificadas que extrapolan datos inexistentes sin rigor documental, **MiniMars** establece un marco de **trazabilidad científica estricta**. El sistema fusiona la pirámide cartográfica orbital real de **NASA Mars Trek OGC WMTS** (mosaicos Viking MDIM 2.1, MRO CTX de $5\text{ m/px}$, MRO HiRISE de $0.25\text{ m/px}$, altimetría láser MOLA e inercia térmica THEMIS IR) con observaciones históricas verificables del rover **MSL Curiosity** (instrumentos RAD, REMS, ChemCam, MAHLI, APXS y cámaras Mastcam entre los soles 4189 y 4844). Sobre esta base empírica, un motor determinista programado en **tRPC y TypeScript** evalúa dos arquitecturas operativas —**Astronauta Solo** frente a **Astronauta acompañado por un Rover de Apoyo**— aplicando un modelo matemático explícito de consumo metabólico de oxígeno ($0.076\text{ kg O}_2/\text{h}$, según referencia *NASA BVAD*) y una **Regla de Decisión de 4 Pasos** donde la seguridad biomecánica y la reserva mínima de retorno ($\ge 25\%\text{ de O}_2$) operan como un filtro previo innegociable frente a la recompensa científica.

---

## 3. ¿Qué Desarrollamos? (*System Architecture & Technical Implementation*)

Desarrollamos una plataforma interactiva de planificación, simulación secuencial y auditoría científica diseñada bajo la ergonomía de un **HUD (*Heads-Up Display*) de muñeca en formato panorámico 16:9**, optimizada para su manipulación con guantes presurizados EVA. El desarrollo se estructura en cuatro pilares técnicos y científicos:

### 3.1. Lienzo Cartográfico Orbital Multicapa (NASA Mars Trek OGC WMTS)
Implementamos un motor cartográfico interactivo en [MarsTrekLeafletMap.tsx](file:///c:/Users/angel/OneDrive/Documentos/GitHub/miniMars-SpaceApp/src/components/MarsTrekLeafletMap.tsx) acoplado a [TacticalMapCanvas.tsx](file:///c:/Users/angel/OneDrive/Documentos/GitHub/miniMars-SpaceApp/src/components/TacticalMapCanvas.tsx) en proyección equirectangular (`EPSG:4326`), que consume en vivo los servicios oficiales de **NASA/JPL Solar System Treks**:
1. **Capa 4.1 — Movilidad y Terreno:** Integra la base multirresolución (Viking $232\text{ m/px} \rightarrow$ CTX $5\text{ m/px} \rightarrow$ HiRISE $0.25\text{ m/px}$), el modelo digital de elevación **MGS MOLA**, la polilínea histórica real de ascenso de *Curiosity* y el perfil topográfico longitudinal ([ElevationProfile.tsx](file:///c:/Users/angel/OneDrive/Documentos/GitHub/miniMars-SpaceApp/src/components/ElevationProfile.tsx)) entre $-3922\text{ m}$ y $-3887\text{ m}$ respecto al datum MOLA.
2. **Capa 4.2 — Seguridad y Supervivencia:** Superpone anillos de riesgo topográfico, umbrales de pendiente crítica ($>22^\circ$) y telemetría puntual de radiación cósmica galáctica (**MSL RAD**, en $\text{mSv/sol}$) y meteorología (**MSL REMS**, presión en $\text{Pa}$ y temperatura en $^\circ\text{C}$).
3. **Capa 4.3 — Interés Científico e Inercia Térmica:** Incorpora el mosaico **Mars Odyssey THEMIS Day IR ($100\text{ m}$)** junto con paradas de muestreo geoquímico documentadas mediante espectrometría láser **ChemCam (LIBS)** y microscopía **MAHLI**.

### 3.2. Escenario Geológico de 4 Nodos y Visor en Primera Persona (POV Curiosity)
El recorrido en [boxwork_mission.ts](file:///c:/Users/angel/OneDrive/Documentos/GitHub/miniMars-SpaceApp/src/data/boxwork_mission.ts) modela cuatro nodos estratégicos vinculados a fotografías reales del catálogo **NASA/JPL Photojournal**:
- **Nodo 1 (`PIA26552`, Sol 4476 — Inicio Seguro):** Umbral de entrada al sector *Boxwork* ($\text{elevación } -3922\text{ m}$, pendiente $6.4^\circ$, dosis GCR $0.63\text{ mSv/sol}$, presión $844\text{ Pa}$, temp. aire $-23.8^\circ\text{C}$). Punto de partida y retorno obligatorio.
- **Nodo 2 (`PIA26364`, Sol 4189 — Zona de Exclusión por Riesgo Alto):** Talud escarpado con pendiente de $24.5^\circ$ ($>22^\circ$) y bloques angulares fracturados. Bloqueado automáticamente por el filtro biomecánico de seguridad para evitar perforación o pérdida de tracción del traje presurizado.
- **Nodo 3 (`PIA26558`, Sol 4541 — Parada Científica 1 / Ruta Histórica):** Red poligonal de crestas minerales *Boxwork* cementadas por antiguos fluidos subterráneos (sulfato de calcio detectado por ChemCam, pendiente $7.5^\circ$, dosis GCR $0.65\text{ mSv/sol}$, temp. suelo $-14.2^\circ\text{C}$).
- **Nodo 4 (`PIA26697`, Sol 4636 — Parada Científica 2 / Desvío Simulado):** Extensión simulada sobre cartografía real de HiRISE ($\text{pendiente } 11.8^\circ$) para inspeccionar nódulos evaporíticos milimétricos con cámara microscópica MAHLI.

### 3.3. Motor Matemático Determinista de Supervivencia EVA (tRPC Backend)
El procedimiento `simulateMission` en [mission.ts](file:///c:/Users/angel/OneDrive/Documentos/GitHub/miniMars-SpaceApp/src/server/api/routers/mission.ts) resuelve en tiempo real el balance de masa de oxígeno, tiempo operativo y descarga energética del rover bajo las siguientes ecuaciones explícitas:

$$\text{Tiempo Total EVA (min)} = t_{\text{ida}} + \sum t_{\text{paradas científicas}}(\text{modo}) + t_{\text{regreso}} + t_{\text{contingencia solar}}$$

$$\text{O}_2\text{ Utilizado (kg)} = \left(\frac{\text{Tiempo Total EVA}}{60}\right) \times \dot{m}_{\text{O}_2}, \quad \text{donde } \dot{m}_{\text{O}_2} = 0.076\text{ kg/h}$$

$$\text{O}_2\text{ Restante (\%)} = \left(\frac{M_{\text{O}_2,\text{inicial}} - \text{O}_2\text{ Utilizado}}{M_{\text{O}_2,\text{inicial}}}\right) \times 100, \quad \text{con } M_{\text{O}_2,\text{inicial}} = 0.380\text{ kg } (5.0\text{ h})$$

En ambos escenarios, el astronauta camina a una velocidad constante de $0.45\text{ km/h}$ ($t_{\text{ida base}} = 80\text{ min}$, $t_{\text{regreso base}} = 80\text{ min}$, y $+25\text{ min}$ de marcha si se activa el desvío al Nodo 4). La diferencia operativa radica en la **función explícita del Rover acompañante**: transportar herramientas/muestras y realizar un pre-escaneo óptico e instrumental que comprime la Parada Científica 1 de $30\text{ min}$ a $15\text{ min}$, y la Parada Científica 2 (Desvío) de $40\text{ min}$ a $15\text{ min}$, a cambio de consumir batería robótica ($\text{reserva mínima } \ge 20\%$).

### 3.4. Matriz de Honestidad Científica y Trazabilidad de Datos
A través de [NodeAuditDrawer.tsx](file:///c:/Users/angel/OneDrive/Documentos/GitHub/miniMars-SpaceApp/src/components/NodeAuditDrawer.tsx) y el modal de auditoría [ScientificAuditModal.tsx](file:///c:/Users/angel/OneDrive/Documentos/GitHub/miniMars-SpaceApp/src/components/ScientificAuditModal.tsx), cada registro del sistema está tipado mediante la interfaz `TelemetryRecord` ([mission.ts](file:///c:/Users/angel/OneDrive/Documentos/GitHub/miniMars-SpaceApp/src/types/mission.ts)), almacenando valor, unidad, sol marciano, instrumento, URL oficial y una clasificación tripartita obligatoria:
- **`[MEDIDO]`:** Lectura empírica in-situ obtenida por instrumentos de *Curiosity* (RAD, REMS, ChemCam, MAHLI, Mastcam).
- **`[DERIVADO]`:** Magnitud física calculada a partir de modelos digitales de elevación orbitales (MOLA / HiRISE DEM) o tasas metabólicas de referencia documental (*NASA BVAD*).
- **`[SIMULADO]`:** Regla operativa del prototipo (capacidad de tanque PLSS de $0.38\text{ kg}$, reserva del $25\%$, trazado de desvío en Nodo 4).
- **Cobertura Nula Explícita (`valor: null`):** Cuando un sensor carece de lectura válida en un punto o sol específico (por ejemplo, el anemómetro REMS en el Sol 4541 o el detector RAD sobre el talud no transitado del Nodo 2), el sistema declara explícitamente la ausencia de cobertura y **prohíbe la extrapolación silenciosa**.

---

## 4. ¿Cómo Responde al Desafío? (*Alignment with the NASA Space Apps Challenge*)

El desafío **Guía de Supervivencia Interplanetaria** plantea la necesidad de diseñar una herramienta que permita a futuros exploradores humanos comprender el entorno marciano, ponderar las condiciones ambientales junto con el terreno y los objetivos científicos, y tomar decisiones fundamentadas para completar su misión y regresar con vida. **MiniMars** responde de manera directa e integral a cada requerimiento del desafío mediante tres mecanismos clave:

### 4.1. Integración Operativa de las Tres Capas Críticas de Supervivencia
En lugar de presentar datos aislados, la aplicación articula en una sola vista táctica las tres dimensiones exigidas para la toma de decisiones EVA:
1. **Terreno y Movilidad:** Identifica corredores seguros ($<8^\circ$) frente a barreras geomorfológicas letales ($>22^\circ$ en el Nodo 2).
2. **Seguridad y Ambiente:** Monitorea la exposición a radiación cósmica galáctica ($\sim 0.63\text{--}0.65\text{ mSv/sol}$), el régimen térmico marciano y el impacto de contingencias solares ($+20\text{ min}$ de protocolo de refugio) sobre el presupuesto de soporte vital.
3. **Retorno Científico:** Vincula cada minuto de consumo de oxígeno con un hallazgo astrobiológico e hidrológico tangible en Mount Sharp (la transición entre venas de sulfato de calcio del Nodo 3 y nódulos evaporíticos tardíos del Nodo 4).

### 4.2. Implementación de la Regla de Decisión de 4 Pasos ([DecisionEnginePanel.tsx](file:///c:/Users/angel/OneDrive/Documentos/GitHub/miniMars-SpaceApp/src/components/DecisionEnginePanel.tsx))
El proyecto resuelve el dilema central de toda exploración planetaria —**¿debemos desviarnos hacia un hallazgo científico de alto valor o regresar a la base?**— mediante un algoritmo auditable de cuatro etapas:
- **Paso 1 (Viabilidad de Reserva):** Verifica que el oxígeno remanente al retornar al Nodo 1 sea $\ge 25\%$ y la batería del rover $\ge 20\%$.
- **Paso 2 (Exclusión de Riesgo Alto):** Descarta de forma absoluta cualquier ruta que atraviese el Nodo 2 ($24.5^\circ$).
- **Paso 3 (Balance Ciencia vs. Costo):** Cuantifica el costo marginal del desvío al Nodo 4 frente a su beneficio geoquímico.
- **Paso 4 (Dictamen Transparente por Escenario):** Demuestra cuantitativamente cómo la cooperación humano-robot transforma la viabilidad de una misión:

| Escenario Operativo | Ruta Seleccionada | Tiempo Total EVA | $\text{O}_2$ Usado ($\text{kg}$) | $\text{O}_2$ Restante al Regreso | Batería Rover Restante | Dictamen del Motor de Supervivencia |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **Astronauta Solo** | Ruta Base (N1 $\rightarrow$ N3 $\rightarrow$ N1) | $190\text{ min}$ | $0.2407\text{ kg}$ | **$36.7\%$** ($\ge 25\%$) | N/A (En base) | **MISIÓN NOMINAL / VIABLE** |
| **Astronauta Solo** | Con Desvío (N1 $\rightarrow$ N3 $\rightarrow$ N4 $\rightarrow$ N1) | $255\text{ min}$ | $0.3230\text{ kg}$ | **$15.0\%$** ($< 25\%$) | N/A (En base) | **DESVÍO RECHAZADO (Alerta Roja: Perfora Reserva)** |
| **Con Rover de Apoyo** | Ruta Base (N1 $\rightarrow$ N3 $\rightarrow$ N1) | $175\text{ min}$ | $0.2217\text{ kg}$ | **$41.7\%$** ($\ge 25\%$) | **$56.0\%$** ($\ge 20\%$) | **MISIÓN NOMINAL / ÓPTIMA** |
| **Con Rover de Apoyo** | Con Desvío (N1 $\rightarrow$ N3 $\rightarrow$ N4 $\rightarrow$ N1) | $215\text{ min}$ | $0.2723\text{ kg}$ | **$28.3\%$** ($\ge 25\%$) | **$32.0\%$** ($\ge 20\%$) | **DESVÍO APROBADO (Ciencia Extra sin violar Reserva)** |

*(Nota: Si además se activa la contingencia de Alerta Solar de $+20\text{ min}$, el sistema recalcula instantáneamente los márgenes, demostrando cómo una perturbación ambiental reduce la ventana de supervivencia).*

---

## 5. ¿Por Qué es Importante? (*Scientific, Operational & Educational Impact*)

El desarrollo de **MiniMars** trasciende el alcance de un demostrador conceptual y aporta valor sustantivo en tres dimensiones fundamentales para el futuro de la exploración espacial:

### 5.1. Cambio de Paradigma: De la Exploración Robótica a la Sinergia Humano-Rover en Marte
Durante más de una década, el rover *Curiosity* ha explorado el Cráter Gale a velocidades de pocos metros por hora. Cuando los primeros astronautas desciendan en Marte, no operarán aislados de los sistemas robóticos ni tendrán suministros ilimitados de soporte vital: cada minuto fuera del hábitat tendrá un costo metabólico inexorable ($\sim 0.076\text{ kg O}_2/\text{h}$) y una exposición acumulativa a radiación ionizante. Nuestro proyecto demuestra matemáticamente que **el rol de un rover acompañante no tiene por qué ser transportar físicamente al astronauta para salvarle la vida**: basta con que el rover actúe como **multiplicador de eficiencia científica** (pre-escaneando afloramientos y portando muestras) para reducir el tiempo estacionario en cada parada y mantener el consumo de oxígeno dentro del margen seguro de retorno ($\ge 25\%$).

### 5.2. Ética de Datos y Rigor Epistemológico contra la "Alucinación" Cartográfica
Un problema recurrente en las herramientas de divulgación y simulación espacial es presentar interpolaciones ficticias como si fueran mediciones continuas de la NASA, borrando la frontera entre la realidad instrumental y el diseño del software. **MiniMars** introduce un estándar de **honestidad científica por diseño**:
- Enseña al usuario que los datos planetarios son **discretos, asincrónicos y dependientes del estado de los instrumentos** (como la pérdida parcial de los sensores de viento de REMS en ciertos soles o la imposibilidad de medir contacto en taludes de $24.5^\circ$).
- Garantiza que ninguna métrica científica se utilice como excusa para vulnerar un filtro de seguridad humana (*Safety-First Architecture*).

### 5.3. Democratización de los Archivos Planetarios de la NASA (PDS y Mars Trek)
Los repositorios científicos como el *Planetary Data System* (PDS Geosciences y PDS Atmospheres) o los documentos técnicos de soporte vital (*NASA BVAD*) suelen resultar inaccesibles para estudiantes, comunicadores y diseñadores de misiones debido a su complejidad técnica y fragmentación. **MiniMars** transforma esos catálogos de nivel de investigación en una experiencia inmersiva en primera persona (POV), permitiendo a cualquier persona ponerse en la piel de un astronauta en Mount Sharp, comprender por qué las formaciones *Boxwork* son clave para descifrar la historia del agua subterránea en Marte, y experimentar de primera mano la tensión real entre el descubrimiento científico y la supervivencia humana.

---

## 6. Referencias y Fuentes Oficiales de la NASA Vinculadas

1. **NASA Life Support Baseline Values and Assumptions Document (BVAD, 2022):** Referencia para la tasa metabólica de consumo de oxígeno en sistema cerrado ($0.076\text{ kg/h}$). [NASA NTRS — BVAD 20210024855](https://ntrs.nasa.gov/api/citations/20210024855/downloads/BVAD_2.15.22-final.pdf)
2. **NASA/JPL Mars Trek OGC WMTS & API:** Mosaicos orbitales Viking MDIM 2.1, MRO CTX, MRO HiRISE ($0.25\text{ m/px}$), altimetría MGS MOLA e inercia térmica Mars Odyssey THEMIS IR. [Mars Trek API Doc](https://trek.nasa.gov/tiles/apidoc/trekAPI.html?body=mars)
3. **NASA Mars Trek — Curiosity Path MapServer:** Geometría polilínea del recorrido histórico de MSL *Curiosity* en Aeolis Mons. [Curiosity Path REST Service](https://trek.nasa.gov/mars/trekarcgis/rest/services/curiosity_path/MapServer/0)
4. **PDS Atmospheres Node — MSL REMS Archive:** Datos meteorológicos de presión barométrica ($\text{Pa}$), temperatura del aire y del suelo ($^\circ\text{C}$). [PDS REMS Archive](https://pdsatmospheres.nmsu.edu/data_and_services/atmospheres_data/MARS/curiosity/rems.html)
5. **PDS Geosciences Node — Mars Science Laboratory (MSL) Archive:** Datos de dosis de radiación cósmica GCR del instrumento RAD y espectrometría geoquímica ChemCam/APXS. [PDS Geosciences MSL](https://pds-geosciences.wustl.edu/missions/msl/)
6. **NASA Science — Curiosity Mission Updates (Sols 4838–4844):** Contexto de exploración de las crestas minerales poligonales en el sector *Boxwork* de Mount Sharp. [NASA Curiosity Boxwork Blog](https://science.nasa.gov/blog/curiosity-blog-sols-4838-4844-wrapping-up-the-boxwork-terrain/)
7. **NASA/JPL Photojournal & MSL Raw Images (`PIA26552`, `PIA26364`, `PIA26558`, `PIA26697`):** Fotografías in-situ de las cámaras Mastcam y MAHLI utilizadas en el visor POV de cada nodo. [MSL Raw Images](https://mars.nasa.gov/msl/multimedia/raw-images/)
8. **USGS Scientific Investigations Map 3292:** Mapa geológico y contexto estratigráfico global de Marte. [USGS SIM 3292](https://pubs.usgs.gov/sim/3292/)

---

## 7. Declaración de Uso de Inteligencia Artificial (*AI Transparency & Disclosure*)

En cumplimiento con los estándares de transparencia e integridad del **NASA Space Apps Challenge**, declaramos que durante el ciclo de diseño, estructuración de código y redacción técnica del proyecto se utilizaron asistentes conversacionales de Inteligencia Artificial como herramientas de apoyo al equipo humano:

- **Ecosistema Google (Gemini):** Asistencia en arquitectura de software (Stack T3 / TypeScript), integración de componentes de interfaz táctica HUD y estructuración de la documentación técnica.
- **OpenAI ChatGPT (Modelo 6 Luna):** Apoyo en la síntesis conceptual de escenarios operativos EVA, validación de casos de uso y organización del flujo narrativo de la misión.
- **Anthropic Claude (Modelo Claude Sonnet 5.5):** Asistencia en refactorización de tipado estricto (`TelemetryRecord`), revisión de lógica determinista en tRPC y pulido de textos académicos.

**Garantía de Integridad Científica:** Ningún dato científico, coordenada cartográfica, fotografía en primera persona (`PIA26552`, `PIA26364`, `PIA26558`, `PIA26697`) ni parámetro de referencia (*NASA BVAD*, *Mars Trek WMTS*, *PDS REMS/RAD*) fue generado sintéticamente por IA. Todos los valores fueron extraídos de fuentes oficiales de la NASA, verificados manualmente por el equipo y auditados mediante la matriz explícita de clasificación (`[MEDIDO]`, `[DERIVADO]`, `[SIMULADO]` y cobertura nula explícita).

