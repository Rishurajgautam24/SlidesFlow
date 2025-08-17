'use client';

import { useEffect, useState, useRef, memo } from 'react';
import type { PDFPageProxy, RenderTask } from 'pdfjs-dist';
import { usePresentation } from './PresentationContext';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

const MemoizedThumbnail = memo(function Thumbnail({ pageNumber, getPage }: { pageNumber: number, getPage: (pageNumber: number) => Promise<PDFPageProxy> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentPage, setCurrentPage } = usePresentation();
  const [isLoading, setIsLoading] = useState(true);
  const isActive = currentPage === pageNumber;

  useEffect(() => {
    let isMounted = true;
    let renderTask: RenderTask | undefined;

    const renderThumbnail = async () => {
      try {
        const page = await getPage(pageNumber);
        if (!isMounted) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const viewport = page.getViewport({ scale: 0.2 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const context = canvas.getContext('2d');
        if (context) {
          renderTask = page.render({ canvasContext: context, viewport });
          await renderTask.promise;
          if (isMounted) {
            setIsLoading(false);
          }
        }
      } catch (error) {
        if ((error as Error).name !== 'RenderingCancelledException') {
            console.error(`Failed to render thumbnail for page ${pageNumber}`, error);
        }
      }
    };
    
    renderThumbnail();

    return () => {
      isMounted = false;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [getPage, pageNumber]);

  return (
    <div
      onClick={() => setCurrentPage(pageNumber)}
      className={cn(
        'p-2 cursor-pointer rounded-md border-2 transition-all relative',
        isActive ? 'border-primary bg-primary/10' : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'
      )}
    >
      {isLoading && <Skeleton className="w-[80px] h-[45px] rounded-sm" />}
      <canvas ref={canvasRef} className={cn("rounded-sm shadow-md", isLoading ? "hidden" : "block")} />
      <p className="text-center text-xs mt-1 font-medium">{pageNumber}</p>
    </div>
  );
});

export default function Sidebar() {
  const { pdf, numPages } = usePresentation();

  const getPage = (pageNumber: number) => pdf.getPage(pageNumber);

  return (
    <aside className="w-48 bg-card border-r flex-shrink-0 z-10 shadow-md hidden md:block">
      <ScrollArea className="h-full p-2">
        <div className="flex flex-col gap-2">
          {Array.from({ length: numPages }, (_, i) => i + 1).map(pageNumber => (
            <MemoizedThumbnail key={`thumb-${pageNumber}`} pageNumber={pageNumber} getPage={getPage} />
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
