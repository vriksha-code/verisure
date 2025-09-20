'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DocumentTypeSchema = z.enum([
    "Aadhaar Card",
    "10th Marksheet",
    "12th Marksheet",
    "Compliance Certificate",
    "Floor Plan",
    "Other"
]);
export type DocumentType = z.infer<typeof DocumentTypeSchema>;


const AnalyzeDocumentAndVerifyInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A document image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  documentType: DocumentTypeSchema.describe("The type of the document being verified."),
  userQuery: z.string().optional().describe("A specific user query if document type is 'Other'"),
});
export type AnalyzeDocumentAndVerifyInput = z.infer<typeof AnalyzeDocumentAndVerifyInputSchema>;

const AnalyzeDocumentAndVerifyOutputSchema = z.object({
  verificationStatus: z
    .enum(['verified', 'rejected', 'requires_manual_review'])
    .describe(
      'The verification status of the document, which can be \'verified\', \'rejected\', or \'requires_manual_review\'.'
    ),
  reason: z.string().describe('The reason for the verification status.'),
  confidenceScore: z
    .number()
    .min(0)
    .max(1)
    .describe(
      'The confidence score of the verification decision, from 0 to 1.'
    ),
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
  prompt: `You are an AI expert in document verification for university admissions.

You will analyze the provided document image based on its type and verify if it meets the required criteria.

Document Type: {{{documentType}}}
Document Image: {{media url=documentDataUri}}

Based on your analysis, determine the verification status, provide a concise reason for your decision, and a confidence score (from 0 to 1). A score of 1 means 100% certain.

Use the following criteria for each document type:
- **Aadhaar Card**: Must contain name, DOB, Aadhaar number, and a valid QR code.
- **10th Marksheet**: Must contain candidate’s name, roll number, school name, and passing year.
- **12th Marksheet**: Must include candidate’s name, roll number, board name, subjects with marks.
- **Compliance Certificate**: Must contain institution name, official seal, and authorized signature.
- **Floor Plan**: Must include at least one labeled fire exit.
- **Other**: Use the user's query to verify the document: {{{userQuery}}}

Verification Status Guidance:
- 'verified': All criteria for the document type are clearly met.
- 'rejected': One or more criteria are clearly not met or the document appears tampered.
- 'requires_manual_review': The document is unclear, some information is ambiguous, or you are not fully confident in the automatic verification.

Return the verification status, reason, and confidence score in the specified JSON format.
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
