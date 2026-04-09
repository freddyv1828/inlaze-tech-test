import axios from 'axios';

interface RawCampaign {
  id: string;
  clicks: number;
  impressions: number;
}

interface ProcessedCampaign {
  id: string;
  clicks: number;
  impressions: number;
  ctr: number;
}

/** 
 * si impressions = 0, el CTR se va a NaN 
 * También faltaba try/catch, si una API fallaba, se daña todo el proceso todo el proceso
 */

async function fetchCampaignData(campaignId: string): Promise<ProcessedCampaign | null> {
  try {
    const response = await axios.get(`https://api.example.com/campaigns/${campaignId}`);
    const data: RawCampaign = response.data;

    const ctr = data.impressions > 0 ? data.clicks / data.impressions : 0;

    return {
      id: data.id,
      clicks: data.clicks,
      impressions: data.impressions,
      ctr: ctr
    };
  } catch (error) {
    console.error(`Error en campaña ${campaignId}:`, error);
    return null;
  }
}

async function processCampaigns(ids: string[]): Promise<ProcessedCampaign[]> {
  const results: ProcessedCampaign[] = [];
  const CONCURRENCY_LIMIT = 3;

  for (let i = 0; i < ids.length; i += CONCURRENCY_LIMIT) {
    const chunk = ids.slice(i, i + CONCURRENCY_LIMIT);
    const promises = chunk.map(id => fetchCampaignData(id));
    const chunkResults = await Promise.all(promises);
    
    for (const res of chunkResults) {
      if (res) results.push(res);
    }
  }

  return results;
}

export function filterAndSortLowCTR(campaigns: ProcessedCampaign[]): ProcessedCampaign[] {
  return campaigns
    .filter(c => c.ctr < 0.02)
    .sort((a, b) => a.ctr - b.ctr);
}