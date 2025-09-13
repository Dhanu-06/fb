/**
 * @fileoverview Defines a Genkit flow for answering natural language queries
 * about financial data (budgets and expenses).
 *
 * This file exports:
 * - `queryFinancials`: The main function to call the flow.
 */
'use server';

import { ai } from '@/ai/genkit';
import { FinancialQueryInput, FinancialQueryInputSchema, FinancialQueryOutput, FinancialQueryOutputSchema } from '@/lib/types';

// Define the prompt for the AI model
const queryPrompt = ai.definePrompt({
  name: 'financialQueryPrompt',
  input: { schema: FinancialQueryInputSchema },
  output: { schema: FinancialQueryOutputSchema },
  prompt: `You are an expert financial analyst for an educational institution.
Your task is to answer questions based on the provided JSON data for budgets and approved expenses.
Be concise and clear in your answers. All monetary values are in Indian Rupees (INR).

Here is the data:
Budgets:
{{{json budgets}}}

Approved Expenses:
{{{json expenses}}}

Now, please answer the following question:
"{{query}}"
`,
});

// Define the main Genkit flow
const queryFinancialsFlow = ai.defineFlow(
  {
    name: 'queryFinancialsFlow',
    inputSchema: FinancialQueryInputSchema,
    outputSchema: FinancialQueryOutputSchema,
  },
  async (input) => {
    // If there's no data, return a specific message
    if (input.budgets.length === 0 && input.expenses.length === 0) {
      return { answer: "I can't answer questions because there is no financial data available yet." };
    }

    const { output } = await queryPrompt(input);
    return output!;
  }
);

// Export a wrapper function to be called from the frontend
export async function queryFinancials(input: FinancialQueryInput): Promise<FinancialQueryOutput> {
  return queryFinancialsFlow(input);
}
