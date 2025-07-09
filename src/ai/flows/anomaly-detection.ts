// anomaly-detection.ts
'use server';

/**
 * @fileOverview Anomaly detection AI agent for call center data.
 *
 * - detectCallAnomalies - A function that handles the call anomaly detection process.
 * - DetectCallAnomaliesInput - The input type for the detectCallAnomalies function.
 * - DetectCallAnomaliesOutput - The return type for the detectCallAnomalies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectCallAnomaliesInputSchema = z.object({
  callData: z.string().describe('The call data to analyze.'),
});
export type DetectCallAnomaliesInput = z.infer<typeof DetectCallAnomaliesInputSchema>;

const DetectCallAnomaliesOutputSchema = z.object({
  anomalies: z.string().describe('The anomalies detected in the call data.'),
  summary: z.string().describe('A summary of the detected anomalies.'),
});
export type DetectCallAnomaliesOutput = z.infer<typeof DetectCallAnomaliesOutputSchema>;

export async function detectCallAnomalies(input: DetectCallAnomaliesInput): Promise<DetectCallAnomaliesOutput> {
  return detectCallAnomaliesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectCallAnomaliesPrompt',
  input: {schema: DetectCallAnomaliesInputSchema},
  output: {schema: DetectCallAnomaliesOutputSchema},
  prompt: `You are an expert in call center data analysis. Analyze the following call data and identify any anomalies, such as sudden spikes in abandoned calls or long queue times. Provide a summary of the detected anomalies.

Call Data: {{{callData}}}
`,
});

const detectCallAnomaliesFlow = ai.defineFlow(
  {
    name: 'detectCallAnomaliesFlow',
    inputSchema: DetectCallAnomaliesInputSchema,
    outputSchema: DetectCallAnomaliesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
