'use server';

/**
 * @fileOverview Analyzes a document and verifies specific elements using AI.
 *
 * - analyzeDocumentAndVerify - A function that handles the document analysis and verification process.
 * - AnalyzeDocumentAndVerifyInput - The input type for the analyzeDocumentAndVerify function.
 * - AnalyzeDocumentAndVerifyOutput - The return type for the analyzeDocumentAndVerify function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeDocumentAndVerifyInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A document image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  verificationTask: z
    .string()
    .describe(
      'The specific verification task to perform, e.g., \'confirm the presence of a signature\' or \'check if the floor plan includes a required fire exit.\''
    ),
});
export type AnalyzeDocumentAndVerifyInput = z.infer<typeof AnalyzeDocumentAndVerifyInputSchema>;

const AnalyzeDocumentAndVerifyOutputSchema = z.object({
  verificationStatus: z
    .enum(['verified', 'rejected', 'requires_manual_review'])
    .describe(
      'The verification status of the document, which can be \'verified\', \'rejected\', or \'requires_manual_review\'.'
    ),
  reason: z.string().describe('The reason for the verification status.'),
});
export type AnalyzeDocumentAndVerifyOutput = z.infer<typeof AnalyzeDocumentAndVerifyOutputSchema>;

export async function analyzeDocumentAndVerify(
  input: AnalyzeDocumentAndVerifyInput
): Promise<AnalyzeDocumentAndVerifyOutput> {
  return analyzeDocumentAndVerifyFlow(input);
}

const analyzeDocumentPrompt = ai.definePrompt({
  name: 'analyzeDocumentPrompt',
  input: {schema: AnalyzeDocumentAndVerifyInputSchema},
  output: {schema: AnalyzeDocumentAndVerifyOutputSchema},
  prompt: `You are an AI expert in document verification.

You will analyze the provided document image and verify the following task: {{{verificationTask}}}.

Based on your analysis of the document, determine the verification status and provide a reason for your determination.

Consider the following when determining the verification status:
- If the document clearly meets the verification task, set the status to \'verified\'.
- If the document clearly fails to meet the verification task, set the status to \'rejected\'.
- If the document is unclear or requires further review, set the status to \'requires_manual_review\'.

Document Image: {{media url=documentDataUri}}

Return the verification status and reason in a JSON format.
`,
});

const analyzeDocumentAndVerifyFlow = ai.defineFlow(
  {
    name: 'analyzeDocumentAndVerifyFlow',
    inputSchema: AnalyzeDocumentAndVerifyInputSchema,
    outputSchema: AnalyzeDocumentAndVerifyOutputSchema,
  },
  async input => {
    const {output} = await analyzeDocumentPrompt(input);
    return output!;
  }
);
