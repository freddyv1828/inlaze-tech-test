/**
 * Estructura par iGaming metrica = ROAS
 */

export type CampaignReport = {
    id: string;                  // Identificador inico de la campaña
    name: string;                // Nombre de la campaña
    metric: number;              // Roas
    status: 'ok' | 'warning' | 'critical'; // Estados de alerta
    evaluatedAt: Date;           // Cuando se evaluo esta campaña
};