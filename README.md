# Inlaze Tech Test - Campaign Monitor (iGaming Edition)

Este proyecto es un sistema de monitoreo automático para campañas publicitarias de iGaming. Detecta variaciones en el ROAS (Return on Ad Spend) y genera alertas basadas en umbrales de rendimiento.

## ⚙️ Configuración del Entorno

EXTERNAL_API_URL=[https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10](https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10)

## 📊 Justificación de la API Seleccionada
Se ha seleccionado la **API de CoinGecko** para simular la fuente de datos de campañas por las siguientes razones:

* **Disponibilidad:** Es una API REST pública de alta confiabilidad que no requiere autenticación compleja para pruebas rápidas.
* **Simulación de iGaming:** Los datos de mercado (volatilidad, volumen) permiten simular de forma realista el comportamiento del **ROAS** en campañas de adquisición de jugadores.
* **Prueba de Resiliencia:** Al ser una API real, permite poner a prueba el manejo de errores de red y la lógica de **Retry con Backoff Exponencial** solicitada en la prueba.

## 🛠️ Stack Tecnológico
* **Node.js & TypeScript:** Para un desarrollo robusto, escalable y con tipado estricto.
* **Axios:** Para el manejo eficiente de peticiones HTTP y timeouts.
* **Dotenv:** Para la gestión segura de variables de entorno, siguiendo las mejores prácticas de seguridad (Twelve-Factor App).



## 📁 Estructura del Proyecto 

* `src/part1/index.ts`: Orquestador principal del proceso de extracción y transformación.
* `src/part1/Types/`: Definición de interfaces y contratos de datos (Type Safety).
* `src/part1/utils/`: Utilidades lógicas y algoritmos de resiliencia (Backoff Exponencial).
* `campaign_results.json`: Salida procesada y clasificada para la integración con **n8n**.


### Implementación
- **Flujo Principal**: Recibe datos de campañas vía Webhook, los procesa y filtra.
- **Bifurcación**: Los estados `critical` se notifican por Discord y los `warning` se registran en Google Sheets.
- **Manejo de Errores**: Se implementó un `Error Trigger` global que notifica fallos en el sistema vía Discord.

### Evidencias
- [https://drive.google.com/drive/folders/1lNIfG70wiL5VZf82hdd9fn-yt0mOyqAC?usp=sharing] 
- El archivo `workflow.json` se encuentra en la raíz para su inspección.

## 🛠️ Diagnóstico y Refactorización

### Problemas Identificados:
1. **Riesgo de división por cero**: El código original no validaba si `impressions` era 0, lo que genera errores matemáticos en el cálculo del CTR.
2. **Ausencia de manejo de excepciones**: Una falla en una sola petición de API bloqueaba el procesamiento de todos los IDs restantes.
3. **Cuello de botella en ejecución**: El loop secuencial (`for...await`) no aprovechaba la capacidad de realizar peticiones en paralelo.

### Mejoras Implementadas:
- Se añadió validación lógica para el cálculo del CTR.
- Se implementó `try/catch` por petición para asegurar la resiliencia del script.
- **Diferenciador Mid**: Se implementó una lógica de **concurrencia controlada** limitando a 3 peticiones simultáneas usando `Promise.all` por lotes (chunks), optimizando el tiempo de ejecución sin saturar el servidor.

###  Consulta de Base de Datos (Prisma)
Se desarrolló una query robusta utilizando la API de Prisma Client para obtener el rendimiento de los últimos 7 días.
- **Lógica de Filtrado**: Uso de operadores `gte` con objetos `Date` dinámicos.
- **Estructura de Datos**: La consulta realiza una selección anidada eficiente para minimizar la transferencia de datos (Overfetching).
- **Procesamiento de Datos**: Se implementó una lógica de agregación manual tras la consulta para garantizar que el ROAS promedio sea exacto por operador, seguida de un ordenamiento ascendente para priorizar la visualización de los "peores" resultados.

## 🤖 Integración con LLM

### Elección del Modelo
Se seleccionó la API de **Google Gemini (1.5 Flash)**.
- **Justificación**: Ofrece una ventana de contexto amplia y alta velocidad de respuesta. Además, su capacidad de razonamiento para generar salidas estructuradas en JSON es superior en su capa gratuita frente a otras alternativas, facilitando la integración con sistemas automatizados.

### Diseño del Prompt
El prompt fue diseñado utilizando la técnica de **Role Prompting** (Analista Senior) y **Few-Shot Delimiters**. Se instruyó al modelo específicamente para priorizar estados críticos y proporcionar acciones accionables, asegurando que la respuesta sea útil para la toma de decisiones y no solo informativa.

### 🧪 Evidencia de Pruebas: Resiliencia del LLM

Se realizó una prueba de ejecución real del módulo de IA (`src/part4/testLLM.ts`). Durante la prueba, se simuló una falla de disponibilidad del modelo (Error 404) para validar la robustez del sistema.

**Resultado obtenido:**
El sistema capturó la excepción de la API de Google de forma controlada (Tarea 19). En lugar de un "crash" del proceso, el servicio retornó un objeto `LLMSummary` de contingencia con:
- Mensaje de error amigable para el usuario.
- Acciones sugeridas manuales en los datos estructurados.

> **Nota:** Se adjunta captura de pantalla en `evidences/resilience_test_llm.png` demostrando que el flujo principal se mantuvo íntegro a pesar de la falla del servicio externo.

## Arquitectura del Agente de IA 
**Decisión:** Utilizar el patrón ReAct (Reasoning + Acting) para el diseño conceptual, detallado en el archivo [DESIGN.md](./DESIGN.md).

**Justificación:** * **Tool-Calling:** Permite que la IA interactúe con el mundo real (pausar campañas) de forma estructurada mediante funciones atómicas.
* **Auditabilidad:** El registro obligatorio del "Thought" (Pensamiento) antes de la "Action" (Acción) es crítico en iGaming para entender la lógica detrás de la detención de una inversión publicitaria.
* **Seguridad:** Se definió un mecanismo de *Human-in-the-loop* para acciones de alto presupuesto (> $10k), mitigando riesgos operativos derivados de posibles alucinaciones del modelo.

> **Nota:** Para una descripción técnica completa, componentes esenciales y diagramas de flujo, consulte el archivo `DESIGN.md` en la raíz del repositorio.

## 🛡️ Trayectoria Técnica y Toma de Decisiones

Para una comprensión profunda de los criterios de ingeniería aplicados en este proyecto, consulte el archivo **[DECISIONS.md](./DECISIONS.md)**.

**¿Para qué sirve este documento?**
A diferencia del código, que explica el *cómo*, el archivo de decisiones explica el **porqué**. En él encontrarás la justificación técnica detrás de:
* La elección de estrategias de concurrencia.
* El manejo resiliente de errores en servicios de IA.
* El diseño de seguridad para acciones automatizadas.

Este registro sirve como la "memoria técnica" del proyecto, garantizando que cualquier desarrollador (o evaluador) pueda seguir la trayectoria lógica y los estándares de calidad seguidos durante el desarrollo.

Guía de Ejecución Local (Paso a Paso)

Para evaluar este proyecto correctamente, siga estas instrucciones en su entorno local:

### 1. Clonación y Dependencias
Clone el repositorio y acceda a la carpeta raíz:
```bash
git clone <url-del-repositorio>
cd inlaze-tech-test
npm install
```
## Configuración del Entorno (Crítico)
El sistema requiere variables de entorno para las peticiones de API y el motor de IA. He proporcionado una plantilla de configuración:

Localice el archivo .env.example en la raíz.

Cree una copia llamada .env:
```bash
cp .env.example .env
```

## Edite el archivo .env e ingrese sus credenciales:

EXTERNAL_API_URL: Ya viene configurada con CoinGecko por defecto.

GEMINI_API_KEY: Ingrese su clave de Google AI Studio (Gemini).

3. Ejecución de los Módulos
El proyecto está dividido en partes ejecutables de forma independiente para facilitar la revisión:

Módulo de Monitoreo (Parte 1): Extrae datos, aplica umbrales y genera el archivo campaign_results.json.

```bash
npx ts-node src/part1/index.ts
```

## Agradecimientos

Muchas gracias por la oportunidad de participar en este proceso de selección. Disfruté mucho resolviendo los retos técnicos propuestos, especialmente la integración y la optimización de procesos en n8n. 

Quedo a su entera disposición para discutir cualquier detalle de mi implementación o realizar una demostración técnica de la solución.

