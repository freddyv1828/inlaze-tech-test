## Decisiones: Parte 1 - Tipado y API

- **Uso de Interfaces:** Se define `CampaignReport` para asegurar la integridad de los datos en todo el pipeline de automatización.
- **Métrica iGaming:** Se eligió el **ROAS** como métrica. 
  - Justificación: En iGaming, el retorno de inversión por cada dólar gastado en captación de jugadores es el KPI más crítico.
- **Umbrales:** - ROAS < 1.0 (Critical): La campaña pierde dinero (gasta más de lo que el jugador deposita).
  - ROAS < 2.5 (Warning): La campaña está cerca del punto de equilibrio, requiere optimización.
  - ROAS >= 2.5 (OK): Campaña saludable y rentable.

## Decisiones: Manejo de Errores y Resiliencia

- **Estrategia de Reintentos:** Se implementó una función utilitaria `retryWithBackoff`.
  - **Por qué:** Las APIs externas pueden fallar por saturación o micro-cortes de red. Reintentar inmediatamente suele empeorar el problema.
  - **Backoff Exponencial:** Se eligió esta técnica para reducir la carga sobre la API durante fallos temporales, duplicando el tiempo de espera en cada intento fallido (1s, 2s, 4s).
  - **Recursividad:** Se utilizó un enfoque recursivo para mantener el código limpio y legible.

## Ajustes de Configuración (Troubleshooting)

- **Configuración de Módulos:** Se ajustó `verbatimModuleSyntax` a `false` en el `tsconfig.json`.
  - **Razón:** Para permitir la exportación de funciones asíncronas compatibles con el entorno de ejecución de Node.js y evitar conflictos de sintaxis entre ESM y CommonJS durante el desarrollo inicial.

## Decisiones: Implementación del Script Principal (Index)

- **Separación de Responsabilidades:** El script `index.ts` actúa como orquestador, delegando la lógica de reintentos a `utils` y la estructura a `types`.
- **Simulación de Negocio:** Dado que la API de CoinGecko devuelve datos de mercado, se utilizó un generador de números aleatorios controlado para simular el **ROAS**, permitiendo testear todos los estados de los umbrales (`ok`, `warning`, `critical`) de manera consistente.
- **Persistencia en JSON:** Se optó por un archivo JSON local (`campaign_results.json`) para facilitar la portabilidad de los datos hacia el flujo de N8N en la siguiente fase de la prueba.

## Decisiones: Configuración de Entorno y Documentación

- **Estandarización de Variables:** Se implementó el uso de `.env` y `.env.example` para cumplir con los estándares de seguridad y portabilidad del proyecto.
- **Estrategia de Documentación:** Se centralizó la justificación técnica en el `README.md` para facilitar la revisión del evaluador, cumpliendo con los criterios de descarte inmediato (README inexistente o incompleto)[cite: 235].

## Conclusión de la Parte 1: Extracción y Evaluación

- **Integridad de Datos:** Se logró la transformación de datos crudos de una API externa a un formato estructurado compatible con el pipeline de iGaming.
- **Validación de Resultados:** El script genera con éxito estados dinámicos (OK, Warning, Critical) basados en métricas simuladas de ROAS, permitiendo una toma de decisiones automatizada en las siguientes etapas.
- **Próximos Pasos:** El archivo `campaign_results.json` queda disponible como la "Single Source of Truth" (Única fuente de verdad) para ser consumido por el flujo de N8N en la Parte 2.

## Decisiones: Organización de Archivos

- **Arquitectura Modular:** Se optó por separar los tipos y las utilidades del núcleo del script (`index.ts`). 
- **Justificación:** Esta estructura permite que el sistema crezca. Si en el futuro se añaden más APIs o métricas, solo se deben crear nuevos archivos en `Types/` o `utils/` sin comprometer la estabilidad del orquestador principal.

## Gestión de Versiones y Control de Cambios

- **Estrategia de Commits:** Se realizó el primer push tras completar la Parte 1.
- **Razón:** Seguir la metodología de "Atomic Commits" (commits atómicos), asegurando que cada entrega en el repositorio sea una versión estable y funcional del sistema. Esto facilita el rollback y la auditoría de código en fases posteriores.

## Análisis de Extensibilidad (Escalabilidad de Fuentes)

- **Desacoplamiento de Datos:** El núcleo del monitor procesa objetos que cumplen con el contrato `CampaignReport`. 
- **Adaptabilidad:** Si se requiere integrar una nueva fuente (ej. Google Ads, Facebook API), solo es necesario crear un nuevo "Adaptador" o función de mapeo que transforme los datos de esa API al tipo `CampaignReport`.
- **Resultado:** El núcleo del script (`index.ts`) y el flujo de salida hacia n8n permanecen intactos, cumpliendo con el principio de Open/Closed (Abierto para extensión, cerrado para modificación).

## Pivotaje de Infraestructura (n8n)

- **Entorno de Orquestación:** Debido a incompatibilidades de versiones entre el entorno local (Node 20) y los requisitos de n8n v2 (Node 22+), se optó por utilizar n8n Cloud para el diseño del flujo.
- **Razón:** Priorizar la entrega de la lógica de automatización y la generación del archivo JSON requerido para la evaluación, evitando retrasos técnicos por configuración de entorno.
- **Integración:** Se preparó el script de la Parte 1 para realizar un envío automático vía POST al obtener el Webhook URL, garantizando la conexión "End-to-End".