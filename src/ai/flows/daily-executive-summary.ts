'use server';

/**
 * @fileOverview An AI agent that provides a daily executive summary of call center metrics and insights.
 *
 * - generateDailySummary - A function that generates the daily summary.
 * - DailySummaryInput - The input type for the generateDailySummary function.
 * - DailySummaryOutput - The return type for the generateDailySummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DailySummaryInputSchema = z.object({
  callData: z.string().describe('A JSON string containing the call center data for the day.'),
});
export type DailySummaryInput = z.infer<typeof DailySummaryInputSchema>;

const DailySummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of key call center metrics and insights for the day.'),
});
export type DailySummaryOutput = z.infer<typeof DailySummaryOutputSchema>;

export async function generateDailySummary(input: DailySummaryInput): Promise<DailySummaryOutput> {
  return dailySummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dailySummaryPrompt',
  input: {schema: DailySummaryInputSchema},
  output: {schema: DailySummaryOutputSchema},
  prompt: `You are an executive assistant specializing in call center performance.
  You are provided with call center data for the day in JSON format.
  Your task is to generate a concise and informative summary of the key metrics and insights.

  Here is the call center data:
  {{callData}}

  Focus on providing actionable insights that an executive can use to understand the call center's performance without analyzing raw data. Include any anomalies or trends.
`,
});

const dailySummaryFlow = ai.defineFlow(
  {
    name: 'dailySummaryFlow',
    inputSchema: DailySummaryInputSchema,
    outputSchema: DailySummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
