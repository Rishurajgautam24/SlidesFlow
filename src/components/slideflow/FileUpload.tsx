'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileUp, FileType } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface FileUploadProps {
  onPdfSelect: (pdf: PDFDocumentProxy) => void;
  onPptSelect: (file: File) => void;
}

export default function FileUpload({ onPdfSelect, onPptSelect }: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null);
      const file = acceptedFiles[0];
      if (!file) return;

      if (file.type === 'application/pdf') {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const loadingTask = pdfjsLib.getDocument(arrayBuffer);
          const pdf = await loadingTask.promise;
          onPdfSelect(pdf);
        } catch (e) {
          setError('Failed to load PDF file. Please ensure it is not corrupted.');
          console.error(e);
        }
      } else if (
        file.type === 'application/vnd.ms-powerpoint' ||
        file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ) {
        onPptSelect(file);
      } else {
        setError('Unsupported file type. Please upload a PDF or a PPT/PPTX file.');
      }
    },
    [onPdfSelect, onPptSelect]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple: false,
    noClick: true,
    noKeyboard: true,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    },
  });

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-4">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
                <FileType className="w-10 h-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-center text-3xl font-bold">SlideFlow</CardTitle>
          <CardDescription className="text-center text-muted-foreground pt-2">Turn any PDF into a powerful presentation</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <FileUp className="w-12 h-12 text-muted-foreground" />
            <p className="mt-4 text-center text-muted-foreground">
              {isDragActive ? 'Drop the file here...' : 'Drag & drop a PDF or PPT file here, or click to select a file'}
            </p>
          </div>
          {error && <p className="mt-4 text-center text-destructive">{error}</p>}
          <div className="text-center mt-6">
            <Button onClick={open}>
              Select File
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
