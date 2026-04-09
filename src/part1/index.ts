import axios from 'axios';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { CampaignReport } from './Types/campaign';
import { retriWithBackoff } from './utils/retry';

// Cargamos configuración
dotenv.config();

const API_URL = process.env.EXTERNAL_API_URL || 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10';

async function run() {
    try {
        console.log('🚀 Conectando con la API de campañas...');
        
        // Usamos retry
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

        fs.writeFileSync('campaign_results.json', JSON.stringify(reports, null, 2));
        console.log('✅ ¡Éxito! Archivo campaign_results.json generado.');
        console.table(reports);

    } catch (error) {
        console.error('❌ Error fatal:', error);
    }
}

run();