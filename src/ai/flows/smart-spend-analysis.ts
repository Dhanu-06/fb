'use server';

/**
 * @fileOverview A smart spend analysis AI agent.
 *
 * - smartSpendAnalysis - A function that handles the smart spend analysis process.
 * - SmartSpendAnalysisInput - The input type for the smartSpendAnalysis function.
 * - SmartSpendAnalysisOutput - The return type for the smartSpendAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartSpendAnalysisInputSchema = z.object({
  receiptDataUri: z
    .string()
    .describe(
      "A receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SmartSpendAnalysisInput = z.infer<typeof SmartSpendAnalysisInputSchema>;

const SmartSpendAnalysisOutputSchema = z.object({
  categorySuggestions: z.array(z.string()).describe('Suggested categories for the expense.'),
  tagSuggestions: z.array(z.string()).describe('Suggested tags for the expense.'),
});
export type SmartSpendAnalysisOutput = z.infer<typeof SmartSpendAnalysisOutputSchema>;

export async function smartSpendAnalysis(input: SmartSpendAnalysisInput): Promise<SmartSpendAnalysisOutput> {
  return smartSpendAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartSpendAnalysisPrompt',
  input: {schema: SmartSpendAnalysisInputSchema},
  output: {schema: SmartSpendAnalysisOutputSchema},
  prompt: `You are an AI assistant that helps admins categorize expenses based on uploaded receipts.

You will analyze the receipt and suggest relevant categories and tags for the expense. 
The categories and tags should be general and applicable to a wide range of expenses.

Analyze the following receipt to determine the categories and tags.

Receipt: {{media url=receiptDataUri}}`,
});

const smartSpendAnalysisFlow = ai.defineFlow(
  {
    name: 'smartSpendAnalysisFlow',
    inputSchema: SmartSpendAnalysisInputSchema,
    outputSchema: SmartSpendAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
