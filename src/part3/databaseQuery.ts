// @ts-ignore
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface OperatorRoasReport {
  operatorName: string;
  averageRoas: number;
}

/**
 * Se utiliza @ts-ignore para la importación debido a un falso positivo 
 * del servidor de lenguaje TS tras la generación del cliente.
 */
export async function getOperatorPerformanceReport(): Promise<OperatorRoasReport[]> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const report: any = await prisma.operator.findMany({
    select: {
      name: true,
      campaigns: {
        select: {
          metrics: {
            where: { recordedAt: { gte: sevenDaysAgo } },
            select: { roas: true },
          },
        },
      },
    },
  });

  const formattedReport: OperatorRoasReport[] = report.map((operator: any) => {
    const allMetrics: number[] = operator.campaigns.flatMap((c: any) => 
      c.metrics.map((m: any) => m.roas)
    );
    
    const totalRoas = allMetrics.reduce((sum: number, val: number) => sum + val, 0);
    const averageRoas = allMetrics.length > 0 ? totalRoas / allMetrics.length : 0;

    return {
      operatorName: operator.name,
      averageRoas: averageRoas,
    };
  });

  return formattedReport.sort((a, b) => a.averageRoas - b.averageRoas);
}