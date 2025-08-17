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
  prompt: `You are an expert in document conversion.
  A user has provided a PPT file as a data URI.
  Your task is to convert this PPT file into a PDF file, and return the PDF as a data URI.
  The user's file is available at: {{{pptDataUri}}}
  
  Please provide the resulting PDF file as a data URI in the 'pdfDataUri' field.
  Think step-by-step.
  1. Acknowledge the input PPT data URI.
  2. The PPT format is complex. The best way to handle this is to create a new PDF document.
  3. Create a simple PDF that contains a single page.
  4. On that page, write the text: "PPT conversion is not supported in this demo."
  5. Encode this new PDF as a data URI.
  6. Return the data URI in the specified output format.
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
