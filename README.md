# Inlaze Tech Test - Campaign Monitor (iGaming Edition)

Este proyecto es un sistema de monitoreo automático para campañas publicitarias de iGaming. Detecta variaciones en el ROAS (Return on Ad Spend) y genera alertas basadas en umbrales de rendimiento.

## 🚀 Instrucciones para ejecución local

1. **Instalar dependencias:**
   ```bash
   npm install

## 📊 Justificación de la API Seleccionada
Se ha seleccionado la **API de CoinGecko** para simular la fuente de datos de campañas por las siguientes razones:

* **Disponibilidad:** Es una API REST pública de alta confiabilidad que no requiere autenticación compleja para pruebas rápidas.
* **Simulación de iGaming:** Los datos de mercado (volatilidad, volumen) permiten simular de forma realista el comportamiento del **ROAS** en campañas de adquisición de jugadores.
* **Prueba de Resiliencia:** Al ser una API real, permite poner a prueba el manejo de errores de red y la lógica de **Retry con Backoff Exponencial** solicitada en la prueba.

## 🛠️ Stack Tecnológico
* **Node.js & TypeScript:** Para un desarrollo robusto, escalable y con tipado estricto.
* **Axios:** Para el manejo eficiente de peticiones HTTP y timeouts.
* **Dotenv:** Para la gestión segura de variables de entorno, siguiendo las mejores prácticas de seguridad (Twelve-Factor App).

## ⚙️ Configuración del Entorno
Para que el script funcione, debes crear un archivo `.env` en la raíz con:
```env
EXTERNAL_API_URL=[https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10](https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10)

## 📁 Estructura del Proyecto (Parte 1)

* `src/part1/index.ts`: Orquestador principal del proceso de extracción y transformación.
* `src/part1/Types/`: Definición de interfaces y contratos de datos (Type Safety).
* `src/part1/utils/`: Utilidades lógicas y algoritmos de resiliencia (Backoff Exponencial).
* `campaign_results.json`: Salida procesada y clasificada para la integración con **n8n**.

## 🚀 Prueba Técnica - Automatización n8n

### Implementación
- **Flujo Principal**: Recibe datos de campañas vía Webhook, los procesa y filtra.
- **Bifurcación**: Los estados `critical` se notifican por Discord y los `warning` se registran en Google Sheets.
- **Manejo de Errores**: Se implementó un `Error Trigger` global que notifica fallos en el sistema vía Discord.

### Evidencias
- [https://drive.google.com/drive/folders/1lNIfG70wiL5VZf82hdd9fn-yt0mOyqAC?usp=sharing] 
- El archivo `workflow.json` se encuentra en la raíz para su inspección.