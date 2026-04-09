# Diseño de Arquitectura: Agente Autónomo de Marketing

Para automatizar la gestión de campañas en el sector iGaming, diseñaría un agente basado en el patrón **ReAct (Reasoning + Acting)**.

## Componentes Esenciales

| Componente | Descripción |
|------------|-------------|
| **Orquestador (LLM)** | Un modelo con capacidad de Tool-Calling (como Gemini 1.5 Pro o GPT-4) que actúa como el "cerebro" del sistema. |
| **Toolkit de Acciones** | Funciones atómicas que el agente puede invocar: `get_campaign_metrics`, `pause_campaign(id)`, `send_slack_alert(msg)`. |
| **Memoria de Contexto** | Para recordar decisiones previas y evitar bucles redundantes (ej: no pausar la misma campaña dos veces seguidas). |

## Lógica de Decisión

El agente **no sigue un script lineal**. En lugar de eso:

1. Recibe un objetivo claro (ej: *"Mantener el ROAS > 2.0"*)
2. Consulta la base de datos mediante sus herramientas
3. Evalúa el estado actual de las campañas
4. Decide autónomamente qué herramienta ejecutar según los umbrales definidos en su **System Prompt**

### Ejemplo de flujo:

Objetivo: "Mantener ROAS > 2.0"
↓
Agente consulta métricas → ROAS actual = 0.5
↓
Agente decide: pausar campaña
↓
Ejecuta: pause_campaign("camp-001")
↓
Registra la acción en el log


## Auditabilidad y Seguridad

Para garantizar la trazabilidad, implementaría:

### 1. Human-in-the-loop (HITL)
- Las acciones críticas (pausar presupuesto alto > $10,000) requieren aprobación humana
- El agente notifica via Slack/Email y espera confirmación

### 2. Trace Log Centralizado
Cada decisión del agente debe registrar:

```json
{
  "thought": "El ROAS es 0.5, está por debajo del umbral de 2.0",
  "action": "pause_campaign",
  "target": "camp-001",
  "justification": "Evitar quema de presupuesto - pérdida del 75%",
  "timestamp": "2026-04-09T10:30:00Z"
}

                    ┌─────────────────┐
                    │   Base de Datos  │
                    │   (PostgreSQL)   │
                    └────────┬────────┘
                             │ (Tool: Query)
                             ↓
┌──────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Usuario/Admin│───→│    AGENTE IA     │───→│   Pensamiento   │
│              │    │   (Orquestador)  │    │ "ROAS bajo,     │
│ "Objetivo:   │    │                  │    │  debo pausar"   │
│  ROAS > 2.0" │    └─────────────────┘    └─────────────────┘
└──────────────┘              │                      │
                             │                      │ (Acción)
                             ↓                      ↓
                    ┌─────────────────┐    ┌─────────────────┐
                    │   Auditoría/Log  │    │ Pausar Campaña  │
                    │   (CloudWatch)   │    │ Enviar Alerta   │
                    └─────────────────┘    └─────────────────┘

