import type { PDFDocumentProxy } from 'pdfjs-dist';
import { PresentationProvider } from '@/components/slideflow/PresentationContext';
import Header from '@/components/slideflow/Header';
import Sidebar from '@/components/slideflow/Sidebar';
import SlideViewer from '@/components/slideflow/SlideViewer';
import Controls from '@/components/slideflow/Controls';
import Toolbar from '@/components/slideflow/Toolbar';

interface PresentationViewProps {
  pdf: PDFDocumentProxy;
  onExit: () => void;
}

export default function PresentationView({ pdf, onExit }: PresentationViewProps) {
  return (
    <PresentationProvider pdf={pdf}>
      <div className="flex flex-col h-screen w-screen bg-gray-100 dark:bg-gray-800">
        <Header onExit={onExit} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 flex flex-col relative overflow-hidden bg-background">
            <Toolbar />
            <SlideViewer />
            <Controls />
          </main>
        </div>
      </div>
    </PresentationProvider>
  );
}
