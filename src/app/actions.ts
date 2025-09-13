'use server';

import { smartSpendAnalysis } from '@/ai/flows/smart-spend-analysis';
import type { SmartSpendAnalysisOutput } from '@/ai/flows/smart-spend-analysis';

export async function analyzeReceipt(receiptDataUri: string): Promise<SmartSpendAnalysisOutput | { error: string }> {
  try {
    const result = await smartSpendAnalysis({ receiptDataUri });
    return result;
  } catch (e: any) {
    console.error("Error in smart spend analysis:", e);
    return { error: e.message || "An unknown error occurred during analysis." };
  }
}
