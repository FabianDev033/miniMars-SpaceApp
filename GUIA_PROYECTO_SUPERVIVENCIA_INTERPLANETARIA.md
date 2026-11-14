# Guía del proyecto — Guía de Supervivencia Interplanetaria

Documento de referencia para organizar las decisiones de producto, datos y simulación del proyecto de NASA Space Apps Challenge. Se actualizará a medida que el equipo cierre las fases pendientes.

## 1. Propósito

Crear una aplicación web interactiva que ayude a explorar decisiones de una misión humana hipotética en Marte. El usuario consultará el terreno, las condiciones ambientales y los sitios de interés científico para decidir cómo completar una misión y regresar con recursos suficientes.

La demo usará datos históricos asociados con la exploración de Curiosity y reglas de simulación propias. No representa una misión humana real ni un sistema certificado para planificar una EVA.

## 2. Decisiones generales cerradas

- **Desafío:** Guía de Supervivencia Interplanetaria.
- **Ubicación:** Monte Sharp, dentro del cráter Gale, explorado por el rover Curiosity.
- **Interfaz:** aplicación portátil para una tablet de muñeca usada por el astronauta.
- **Escenarios:** astronauta solo y astronauta acompañado por un rover.
- **Escenario de datos:** histórico y predefinido (hardcodeado); no se requiere información en tiempo real.
- **Desarrollo:** TypeScript con el stack **Stack T3**. La arquitectura concreta se definirá más adelante.
- **API:** se contempla una API local para entregar los datos seleccionados a la aplicación.
- **Equipo y dispositivos:** tres personas y una computadora. Las tareas que requieren la computadora se realizan por turnos; se puede trabajar en paralelo desde los celulares.

## 3. Fase 1 — Alcance y escenario

### Misión

El astronauta parte de un punto seguro, visita un sitio de interés científico y regresa. La misión se presenta de forma secuencial: salida, recorrido de ida, visita científica y regreso.

### Recorrido

- Priorizar un tramo **realmente recorrido por Curiosity** en el terreno boxwork de Mount Sharp.
- Mantener como posible ampliación una ruta ficticia sobre cartografía real de Mount Sharp, claramente identificada como simulada.
- No describir una ruta propuesta por NASA como si fuera un trayecto efectivamente recorrido.
- El tramo boxwork es la selección de trabajo; sus puntos exactos de inicio y fin aún deben verificarse en la geometría de ruta disponible.

### Período histórico

Elegir una etapa histórica de referencia. Si las capas requieren combinar fechas distintas, conservar y mostrar la fecha o el sol de cada dato. El terreno puede servir como contexto geográfico estable; las mediciones ambientales y científicas deben mantener su fecha y ubicación.

### Comparación de escenarios

Inicialmente, los escenarios recorrerán la misma ruta. El astronauta camina en ambos: el modo con rover representa a un rover que lo acompaña. Más adelante, si alcanza el tiempo, se podrá mostrar una alerta y un desvío sugerido.

### Éxito de la misión

La misión es exitosa si el astronauta visita el punto científico y regresa al punto seguro con recursos por encima de la reserva definida para la simulación.

## 4. Fase 2 — Datos y capas

### Capas acordadas

#### 4.1 Movilidad y terreno

- Usar una imagen del terreno como fondo del mapa.
- Incorporar elevación o pendiente del recorrido mediante un perfil o una señal visual sencilla.
- Resaltar el trayecto histórico y sus puntos de ruta.

#### 4.2 Seguridad y supervivencia

- Empezar con mediciones históricas de radiación y variables atmosféricas en puntos concretos del recorrido.
- Si hay tiempo y cobertura suficiente, valorar una visualización más extendida.
- Cualquier dato extrapolado o extendido será identificado como estimación o simulación, nunca como medición continua.

#### 4.3 Interés científico

- Combinar contexto geológico con dos o tres paradas científicas.
- Asociar cada parada a una observación identificable de Curiosity, como una imagen o un análisis instrumental.
- No representar observaciones puntuales como cobertura científica continua de todo el terreno.

### Volumen inicial de datos

- Un tramo breve.
- Tres o cuatro puntos de ruta.
- Dos o tres paradas científicas.
- Un conjunto pequeño de variables por capa.

### Fuentes de datos propuestas

| Uso | Fuente | Qué aporta / observación |
|---|---|---|
| Base cartográfica, mosaicos y capas de Marte | [NASA Mars Trek — documentación de capas](https://trek.nasa.gov/tiles/apidoc/trekAPI.html?body=mars) | Capas de imágenes y productos de Marte, incluidos mosaicos del sitio de Curiosity. Verificar cobertura y proyección para el tramo seleccionado. |
| Geometría de recorrido de Curiosity | [NASA Mars Trek — capa de ruta](https://trek.nasa.gov/mars/trekarcgis/rest/services/curiosity_path/MapServer/0) | Capa polilínea consultable; comprobar que la extensión cubra el segmento boxwork elegido antes de adoptarla como ruta. |
| Referencia histórica de ruta | [NASA/JPL — Curiosity desde el aterrizaje hasta Pahrump Hills](https://www.jpl.nasa.gov/images/pia19067-curiosity-mars-rovers-route-from-landing-to-base-of-mount-sharp/) | Mapa de un recorrido real de Curiosity hasta la base de Mount Sharp; sirve de referencia histórica, no corresponde por sí mismo al tramo boxwork. |
| Pendiente y elevación | [NASA Solar System Treks — herramientas](https://trek.jpl.nasa.gov/) | Permite medir distancia y consultar perfil de elevación, con opción de exportar el perfil. Confirmar cobertura y unidades del área seleccionada. |
| Clima / REMS | [PDS Atmospheres — archivo REMS](https://pdsatmospheres.nmsu.edu/data_and_services/atmospheres_data/MARS/curiosity/rems.html) | Datos de viento, presión, humedad, temperatura del aire y del suelo, y radiación UV. Revisar el producto procesado y la cobertura temporal disponible. |
| Radiación / RAD y datos de instrumentos MSL | [PDS Geosciences — misión MSL](https://pds-geosciences.wustl.edu/missions/msl/) | Catálogo y accesos a los archivos de Curiosity, incluidos RAD, REMS, ChemCam, APXS, MAHLI y mapas/localización. |
| Imágenes científicas de Curiosity | [NASA — imágenes sin procesar de Curiosity](https://mars.nasa.gov/msl/multimedia/raw-images/) | Permite buscar imágenes por instrumento y sol. Seleccionar imágenes del área y período del escenario. |
| Observaciones boxwork | [NASA — actividad de Curiosity en boxwork, soles 4838–4844](https://science.nasa.gov/blog/curiosity-blog-sols-4838-4844-wrapping-up-the-boxwork-terrain/) | Contexto de desplazamientos y observaciones con instrumentos durante la investigación del terreno boxwork. |
| Contexto geológico regional | [USGS — mapa geológico de Marte](https://pubs.usgs.gov/sim/3292/) | Referencia geológica a escala global; no usar como único soporte para detalles de escala local. |

### Organización y presentación de los datos

- Preparar un conjunto local curado en JSON/GeoJSON para la demo.
- Mostrar los datos por ubicación en un menú o panel desplegable, en vez de saturar el mapa.
- Aunque no se vean siempre, guardar con cada registro: nombre, valor, unidad, ubicación, fecha o sol, instrumento, fuente y clasificación (**medido**, **derivado** o **simulado**).
- Si una ubicación no tiene datos para una capa, indicarlo explícitamente; no completar el espacio como si existiera una medición.
- Antes de integrar datos cartográficos, confirmar el sistema de coordenadas y normalizarlo para que coincida con el mapa de la aplicación.

### Pendientes de cierre de Fase 2

1. Verificar la geometría de la ruta histórica en el sector boxwork y definir inicio y fin.
2. Elegir tres o cuatro puntos de ruta y dos o tres paradas científicas.
3. Confirmar para cada punto qué datos de terreno, seguridad y ciencia tienen cobertura real.
4. Fijar los soles/período y registrar las fechas individuales cuando las capas no coincidan temporalmente.
5. Preparar la tabla o archivos locales y revisar la conversión de coordenadas.

## 5. Fase 3 — Lógica de supervivencia

### Decisiones acordadas

- El rover acompaña al astronauta; el astronauta camina todo el recorrido en ambos escenarios.
- Mostrar tres variables: oxígeno, tiempo de actividad extravehicular (EVA) y energía del rover.
- Descontar los recursos según la duración de cada actividad: desplazamiento, parada científica y regreso.
- Mostrar mediciones históricas en los puntos correspondientes y, por separado, categorías de riesgo simuladas por tramo.
- Una parada científica consume tiempo y, por lo tanto, recursos.
- La alerta principal se activa cuando la proyección indica que el regreso podría dejar al astronauta por debajo de la reserva de misión. Alertas de riesgo sirven como apoyo.

### Modelo inicial propuesto

```text
tiempo total de EVA = desplazamiento de ida + paradas científicas + desplazamiento de regreso
oxígeno utilizado = horas de EVA × tasa de referencia seleccionada
```

NASA documenta tasas de uso de oxígeno que dependen del diseño del sistema de soporte vital. El valor de **0,076 kg/h** corresponde a un caso específico de sistema completamente cerrado; puede usarse como referencia de magnitud, no como tasa universal de cualquier traje. Las velocidades, duraciones, energía de rover y reserva serán parámetros explícitos de la simulación. [NASA — Life Support Baseline Values and Assumptions](https://ntrs.nasa.gov/api/citations/20210024855/downloads/BVAD_2.15.22-final.pdf)

### Regla propuesta para desvíos

La seguridad funciona como filtro previo, no como un costo que pueda compensarse con mayor interés científico:

1. **Comprobar viabilidad:** el astronauta debe poder completar el desvío y regresar con tiempo y oxígeno suficientes para conservar la reserva definida. En el escenario con rover, también debe quedar energía para la función de apoyo acordada.
2. **Excluir riesgos inaceptables:** no recomendar un desvío que atraviese un tramo clasificado como riesgo alto por las reglas de la simulación.
3. **Comparar ciencia y costo entre rutas viables:** valorar si el desvío ofrece una observación nueva o relevante y compararlo con el tiempo y los recursos adicionales.
4. **Explicar la recomendación:** mostrar el beneficio científico, tiempo añadido, oxígeno proyectado para el regreso, reserva restante, batería del rover, categoría de riesgo y fuentes disponibles.

La recomendación será transparente y comprensible para el astronauta. Los umbrales de reserva y las categorías de riesgo son reglas del prototipo; no se presentarán como límites médicos u operativos de NASA.

### Pendiente de cierre de Fase 3

Definir la función concreta del rover cuando acompaña al astronauta (por ejemplo, transporte de equipo, observación/remoto o apoyo a la exploración). La comparación no debe asumir que el rover reduce el tiempo o el consumo de oxígeno mientras el astronauta camina, salvo que el equipo incorpore y etiquete explícitamente esa regla simulada.

## 6. Hoja de ruta posterior

### Fase 4 — Experiencia e interfaz

- Definir la pantalla principal de la tablet de muñeca.
- Diseñar los controles de las tres capas, la ficha desplegable por ubicación y las alertas.
- Mostrar comparación entre astronauta solo y astronauta con rover.
- Priorizar lectura rápida, texto claro y acciones simples.

### Fase 5 — Integración y relato

- Integrar mapa, datos locales y reglas de simulación.
- Preparar una secuencia de demo: planificar, desplazarse, decidir si desviarse, completar ciencia y regresar.
- Preparar fuentes, créditos y explicación de los datos medidos y simulados.

### Fase 6 — Revisión final

- Comprobar que la historia y las tres capas se entienden sin explicación adicional.
- Revisar fuentes, fechas, unidades, metadatos y distinción entre medición y simulación.
- Ajustar la demo según la prueba con personas ajenas al equipo.

## 7. Organización del equipo

Responsabilidades rotativas sugeridas:

1. **Interfaz/código:** integración del prototipo en la computadora.
2. **Datos/cartografía:** búsqueda, selección y registro de datos y fuentes.
3. **Misión/UX/pitch:** lógica de ruta, bocetos, documentación y presentación.

Como hay una sola computadora, el trabajo que requiere editar o ejecutar el prototipo se planifica por turnos. Mientras tanto, los otros integrantes pueden investigar fuentes, preparar datos, bocetar pantallas y redactar desde los celulares. Antes de cada turno, dejar anotado qué archivo o pantalla se modificará y qué resultado debe quedar listo.

## 8. Registro de decisiones

| Tema | Estado |
|---|---|
| Marte / Mount Sharp / Curiosity | Definido |
| Aplicación portátil para tablet de muñeca | Definido |
| Stack T3 con TypeScript | Definido; arquitectura pendiente |
| Misión de ida a punto científico y regreso | Definido |
| Tramo boxwork como candidato principal | Elegido como candidato; geometría exacta pendiente |
| Tres capas de datos | Definidas |
| Conjunto local de datos históricos | Definido para la demo |
| Recursos, alertas y parada científica | Definidos a nivel de reglas; valores de simulación pendientes |
| Función del rover de apoyo | Pendiente |
