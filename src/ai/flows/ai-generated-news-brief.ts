'use server';
/**
 * @fileOverview An AI agent that provides a brief, AI-generated summary of a relevant top news story or current affair.
 *
 * - generateNewsBrief - A function that handles the news brief generation process.
 * - AiGeneratedNewsBriefInput - The input type for the generateNewsBrief function.
 * - AiGeneratedNewsBriefOutput - The return type for the generateNewsBrief function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiGeneratedNewsBriefInputSchema = z.object({
  channelName: z.string().describe('The name or theme of the news channel to provide context for the news brief.'),
});
export type AiGeneratedNewsBriefInput = z.infer<typeof AiGeneratedNewsBriefInputSchema>;

const AiGeneratedNewsBriefOutputSchema = z.object({
  newsBrief: z.string().describe('A brief, AI-generated summary of a relevant top news story or current affair.'),
});
export type AiGeneratedNewsBriefOutput = z.infer<typeof AiGeneratedNewsBriefOutputSchema>;

export async function generateNewsBrief(input: AiGeneratedNewsBriefInput): Promise<AiGeneratedNewsBriefOutput> {
  return generateNewsBriefFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNewsBriefPrompt',
  input: {schema: AiGeneratedNewsBriefInputSchema},
  output: {schema: AiGeneratedNewsBriefOutputSchema},
  prompt: `You are an AI assistant tasked with generating a very brief summary of a top news story or current affair.
Focus on recent and relevant information that would be of interest to a viewer of a news channel.
The news brief should be concise and no more than two sentences long.

Context provided by the channel name: {{{channelName}}}

Generate a news brief for this channel's context:`,
});

const generateNewsBriefFlow = ai.defineFlow(
  {
    name: 'generateNewsBriefFlow',
    inputSchema: AiGeneratedNewsBriefInputSchema,
    outputSchema: AiGeneratedNewsBriefOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
