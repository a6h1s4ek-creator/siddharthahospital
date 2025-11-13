'use server';

/**
 * @fileOverview This file defines a Genkit flow for the Smart Suggestion Tool.
 *
 * The tool suggests relevant medical information based on the current patient's record.
 * It exports the diagnosePlant function, DiagnosePlantInput type, and DiagnosePlantOutput type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// Define the input schema
const SmartSuggestionToolInputSchema = z.object({
  patientRecord: z
    .string()
    .describe('The current patient\'s medical record.'),
  userRole: z
    .string()
    .describe('The role of the user (e.g., doctor, nurse).'),
  currentContext: z
    .string()
    .describe('The current context or task the user is performing.'),
});

export type SmartSuggestionToolInput = z.infer<typeof SmartSuggestionToolInputSchema>;

// Define the output schema
const SmartSuggestionToolOutputSchema = z.object({
  suggestions: z.array(
    z.string().describe('A relevant suggestion or piece of information.')
  ),
  reasoning: z.string().describe('The reasoning behind the suggestions.'),
});

export type SmartSuggestionToolOutput = z.infer<typeof SmartSuggestionToolOutputSchema>;

// Define the flow function
export async function smartSuggestionTool(input: SmartSuggestionToolInput): Promise<SmartSuggestionToolOutput> {
  return smartSuggestionToolFlow(input);
}

// Define the prompt
const smartSuggestionPrompt = ai.definePrompt({
  name: 'smartSuggestionPrompt',
  input: {schema: SmartSuggestionToolInputSchema},
  output: {schema: SmartSuggestionToolOutputSchema},
  prompt: `You are an AI assistant designed to provide smart suggestions for medical professionals.

  Based on the current patient record, user role, and current context, suggest relevant medical information or actions.

  Patient Record: {{{patientRecord}}}
  User Role: {{{userRole}}}
  Current Context: {{{currentContext}}}

  Provide a list of suggestions and a brief explanation of why each suggestion is relevant. Format suggestions as a numbered list.
  Include the reasoning behind the suggestions.

  Output the suggestions in the following JSON format:
  {suggestions: string[], reasoning: string}
  `,
});

// Define the flow
const smartSuggestionToolFlow = ai.defineFlow(
  {
    name: 'smartSuggestionToolFlow',
    inputSchema: SmartSuggestionToolInputSchema,
    outputSchema: SmartSuggestionToolOutputSchema,
  },
  async input => {
    const {output} = await smartSuggestionPrompt(input);
    return output!;
  }
);
