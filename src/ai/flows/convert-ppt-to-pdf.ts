'use server';

/**
 * @fileOverview Converts a PPT file to PDF format using an AI model.
 *
 * - convertPptToPdf - A function that handles the PPT to PDF conversion.
 * - ConvertPptToPdfInput - The input type for the convertPptToPdf function.
 * - ConvertPptToPdfOutput - The return type for the convertPptToPdf function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConvertPptToPdfInputSchema = z.object({
  pptDataUri: z
    .string()
    .describe(
      "A PPT file as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ConvertPptToPdfInput = z.infer<typeof ConvertPptToPdfInputSchema>;

const ConvertPptToPdfOutputSchema = z.object({
  pdfDataUri: z.string().describe('The converted PDF file as a data URI.'),
});
export type ConvertPptToPdfOutput = z.infer<typeof ConvertPptToPdfOutputSchema>;

export async function convertPptToPdf(input: ConvertPptToPdfInput): Promise<ConvertPptToPdfOutput> {
  return convertPptToPdfFlow(input);
}

const convertPptToPdfPrompt = ai.definePrompt({
  name: 'convertPptToPdfPrompt',
  input: {schema: ConvertPptToPdfInputSchema},
  output: {schema: ConvertPptToPdfOutputSchema},
  prompt: `You are an expert in converting PPT files to PDF format.

  Convert the following PPT file to PDF format. Return the PDF as a data URI.

  PPT File: {{media url=pptDataUri}}
  `,
});

const convertPptToPdfFlow = ai.defineFlow(
  {
    name: 'convertPptToPdfFlow',
    inputSchema: ConvertPptToPdfInputSchema,
    outputSchema: ConvertPptToPdfOutputSchema,
  },
  async input => {
    const {output} = await convertPptToPdfPrompt(input);
    return output!;
  }
);
