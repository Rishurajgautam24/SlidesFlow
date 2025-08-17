'use client';

import { useEffect, useState } from 'react';
import { convertPptToPdf } from '@/ai/flows/convert-ppt-to-pdf';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface PptConverterProps {
  file: File;
  onConversionComplete: (pdf: PDFDocumentProxy) => void;
  onBack: () => void;
}

export default function PptConverter({ file, onConversionComplete, onBack }: PptConverterProps) {
  const [status, setStatus] = useState<'converting' | 'success' | 'error'>('converting');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const convert = async () => {
      try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          try {
            const dataUri = reader.result as string;
            const result = await convertPptToPdf({ pptDataUri: dataUri });
            const pdfDataUri = result.pdfDataUri;

            const pdfBase64 = pdfDataUri.split(',')[1];
            const pdfBytes = atob(pdfBase64);
            const len = pdfBytes.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              bytes[i] = pdfBytes.charCodeAt(i);
            }
            
            const loadingTask = pdfjsLib.getDocument(bytes.buffer);
            const pdf = await loadingTask.promise;
            setStatus('success');
            onConversionComplete(pdf);
          } catch(e) {
            console.error('Conversion or PDF loading failed:', e);
            setError('An error occurred during conversion. The file might be unsupported or corrupted.');
            setStatus('error');
          }
        };
        reader.onerror = (error) => {
            console.error('FileReader error:', error);
            setError('Could not read the PPT file.');
            setStatus('error');
        }
      } catch (e) {
        console.error('File reading setup failed:', e);
        setError('An unexpected error occurred. Please try again.');
        setStatus('error');
      }
    };

    convert();
  }, [file, onConversionComplete]);

  return (
    <div className="flex items-center justify-center h-full w-full">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>PPT to PDF Conversion</CardTitle>
          <CardDescription>
            {status === 'converting' && `Converting "${file.name}"...`}
            {status === 'error' && `Conversion Failed`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'converting' && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <p className="text-muted-foreground">Please wait, this may take a moment.</p>
            </div>
          )}
          {status === 'error' && (
            <div className="flex flex-col items-center gap-4">
              <AlertTriangle className="h-16 w-16 text-destructive" />
              <p className="bg-destructive/10 text-destructive p-3 rounded-md">{error}</p>
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
