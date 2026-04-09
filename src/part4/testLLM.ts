import { generateCampaignSummary } from './llmService';

// Datos de prueba (Simulando el output de la Parte 1)
const mockReports: any[] = [
  { id: '1', name: 'Campaign Alpha', status: 'critical', metric: 0.01 },
  { id: '2', name: 'Campaign Beta', status: 'warning', metric: 0.015 },
  { id: '3', name: 'Campaign Gamma', status: 'ok', metric: 0.05 },
  { id: '4', name: 'Campaign Delta', status: 'critical', metric: 0.008 }
];

async function runTest() {
  console.log("🚀 Iniciando petición al LLM (Gemini 1.5 Flash)...");
  
  const result = await generateCampaignSummary(mockReports);

  console.log("\n--- RESULTADO DEL LLM ---");
  console.log(`📅 Generado en: ${result.generatedAt}`);
  console.log(`🤖 Modelo: ${result.model}`);
  console.log(`📝 Resumen: ${result.summary}`);
  
  if (result.structuredData) {
    console.log("\n--- DATOS ESTRUCTURADOS ---");
    console.log("🚨 Campañas Críticas:", result.structuredData.criticalCampaigns);
    console.log("💡 Acciones Sugeridas:", result.structuredData.suggestedActions);
  }
}

runTest().catch(console.error);