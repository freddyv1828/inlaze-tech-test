import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';

dotenv.config();

// Tipado estricto para la respuesta
export interface LLMSummary {
  generatedAt: Date;
  model: string;
  summary: string;
  structuredData?: {
    criticalCampaigns: string[];
    suggestedActions: string[];
  };
}

// Interfaz para el input 
interface CampaignReport {
  id: string;
  name: string;
  status: 'ok' | 'warning' | 'critical';
  metric: number;
}

/**
 * Generación de resumen ejecutivo con LLM
 */
export async function generateCampaignSummary(reports: CampaignReport[]): Promise<LLMSummary> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  // Tarea 17: Prompt con instrucciones concretas
  const prompt = `
    Actúa como un Analista de Marketing Senior. Evalúa los siguientes datos de campañas:
    ${JSON.stringify(reports, null, 2)}

    Instrucciones:
    1. Identifica y destaca campañas en estado 'critical'.
    2. Resume el estado general de las campañas en 'warning'.
    3. Sugiere al menos una acción concreta basada en los datos.
    
    Responde ÚNICAMENTE en formato JSON con la siguiente estructura:
    {
      "summary": "texto del resumen",
      "criticalCampaigns": ["nombres de campañas"],
      "suggestedActions": ["acción 1", "acción 2"]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parseo de la respuesta estructurada
    const parsed = JSON.parse(text.replace(/```json|```/g, ""));

    return {
      generatedAt: new Date(),
      model: "gemini-1.5-flash",
      summary: parsed.summary,
      structuredData: {
        criticalCampaigns: parsed.criticalCampaigns,
        suggestedActions: parsed.suggestedActions
      }
    };
  } catch (error) {
    // Manejo de errores para que el sistema no se rompa
    console.error("Error en la llamada al LLM:", error);
    return {
      generatedAt: new Date(),
      model: "gemini-1.5-flash",
      summary: "Error: No se pudo generar el resumen ejecutivo en este momento.",
      structuredData: {
        criticalCampaigns: [],
        suggestedActions: ["Revisar manualmente las métricas debido a una falla en el servicio de IA."]
      }
    };
  }
}