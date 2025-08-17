import type { PDFDocumentProxy } from 'pdfjs-dist';
import { PresentationProvider, usePresentation } from '@/components/slideflow/PresentationContext';
import Header from '@/components/slideflow/Header';
import Sidebar from '@/components/slideflow/Sidebar';
import SlideViewer from '@/components/slideflow/SlideViewer';
import Controls from '@/components/slideflow/Controls';

interface PresentationViewProps {
  pdf: PDFDocumentProxy;
  onExit: () => void;
}

function PresentationLayout({ onExit }: { onExit: () => void }) {
  const { isFullscreen } = usePresentation();

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-100 dark:bg-gray-800">
      {!isFullscreen && <Header onExit={onExit} />}
      <div className="flex flex-1 overflow-hidden">
        {!isFullscreen && <Sidebar />}
        <main className="flex-1 flex flex-col relative overflow-hidden bg-background">
          <SlideViewer />
          <Controls />
        </main>
      </div>
    </div>
  );
}

export default function PresentationView({ pdf, onExit }: PresentationViewProps) {
  return (
    <PresentationProvider pdf={pdf}>
      <PresentationLayout onExit={onExit} />
    </PresentationProvider>
  );
}
