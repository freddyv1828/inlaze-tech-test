import axios from 'axios';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { CampaignReport } from './Types/campaign';
import { retriWithBackoff } from './utils/retry'; // Corregido typo

// Cargamos configuración
dotenv.config();

const API_URL = process.env.EXTERNAL_API_URL || 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10';
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

async function run() {
    try {
        console.log('🚀 Conectando con la API de campañas...');
        
        // Usamos retry profesional
        const response = await retriWithBackoff(() => axios.get(API_URL));
        
        const reports: CampaignReport[] = response.data.slice(0, 5).map((item: any) => {
            const roas = parseFloat((Math.random() * 5).toFixed(2));
            let status: 'ok' | 'warning' | 'critical' = 'ok';
            
            if (roas < 1.0) status = 'critical';
            else if (roas < 2.5) status = 'warning';

            return {
                id: item.id,
                name: item.name,
                metric: roas,
                status: status,
                evaluatedAt: new Date()
            };
        });

        // 1. Guardar localmente
        fs.writeFileSync('campaign_results.json', JSON.stringify(reports, null, 2));
        console.log('✅ ¡Éxito! Archivo campaign_results.json generado.');
        console.table(reports);

        // 2. Enviar a n8n si la URL existe
        if (N8N_WEBHOOK_URL) {
            console.log('📤 Enviando payload a n8n...');
            await axios.post(N8N_WEBHOOK_URL, reports);
            console.log('🚀 Datos sincronizados con el flujo de automatización.');
        } else {
            console.log('⚠️ N8N_WEBHOOK_URL no definida en .env. Saltando integración.');
        }

    } catch (error) {
        console.error('❌ Error fatal:', error);
    }
}

run();