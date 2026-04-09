## Decisiones: Parte 1 - Tipado y API

- **Uso de Interfaces:** Se define `CampaignReport` para asegurar la integridad de los datos en todo el pipeline de automatización.
- **Métrica iGaming:** Se eligió el **ROAS** como métrica. 
  - Justificación: En iGaming, el retorno de inversión por cada dólar gastado en captación de jugadores es el KPI más crítico.
- **Umbrales:** - ROAS < 1.0 (Critical): La campaña pierde dinero (gasta más de lo que el jugador deposita).
  - ROAS < 2.5 (Warning): La campaña está cerca del punto de equilibrio, requiere optimización.
  - ROAS >= 2.5 (OK): Campaña saludable y rentable.