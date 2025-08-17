'use client';

import { useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import FileUpload from '@/components/slideflow/FileUpload';
import PresentationView from '@/components/slideflow/PresentationView';
import PptConverter from '@/components/slideflow/PptConverter';

export default function Home() {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [fileToConvert, setFileToConvert] = useState<File | null>(null);

  const handlePdfLoad = (loadedPdf: PDFDocumentProxy) => {
    setPdf(loadedPdf);
    setFileToConvert(null);
  };

  const handlePptSelect = (file: File) => {
    setFileToConvert(file);
    setPdf(null);
  };

  const reset = () => {
    setPdf(null);
    setFileToConvert(null);
  };

  return (
    <main className="h-screen w-screen bg-background text-foreground flex flex-col">
      {!pdf && !fileToConvert && (
        <FileUpload onPdfSelect={handlePdfLoad} onPptSelect={handlePptSelect} />
      )}
      {fileToConvert && !pdf && (
        <PptConverter file={fileToConvert} onConversionComplete={handlePdfLoad} onBack={reset} />
      )}
      {pdf && <PresentationView pdf={pdf} onExit={reset} />}
    </main>
  );
}
