'use client';
import { ArrowLeft, ArrowRight, Expand, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePresentation } from './PresentationContext';
import { useState, useEffect } from 'react';
import TimerClock from './TimerClock';
import Toolbar from './Toolbar';

export default function Controls() {
  const { currentPage, numPages, goToPrevPage, goToNextPage, setCurrentPage, isFullscreen, toggleFullscreen } = usePresentation();
  const [inputValue, setInputValue] = useState(currentPage.toString());

  useEffect(() => {
    setInputValue(currentPage.toString());
  }, [currentPage]);
  
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }

  const handlePageInputBlur = () => {
    const pageNum = parseInt(inputValue, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= numPages) {
      setCurrentPage(pageNum);
    } else {
      setInputValue(currentPage.toString());
    }
  }

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        e.currentTarget.blur();
    }
  }

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4">
      <Toolbar />
      <div className="flex items-center gap-2 p-1 bg-background rounded-lg shadow-lg border">
        <TimerClock />

        <Button variant="ghost" size="icon" onClick={goToPrevPage} disabled={currentPage <= 1}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center text-sm font-medium">
          <input
            type="text"
            value={inputValue}
            onChange={handlePageInputChange}
            onBlur={handlePageInputBlur}
            onKeyDown={handlePageInputKeyDown}
            className="w-8 text-center bg-transparent focus:outline-none focus:ring-1 focus:ring-primary rounded-sm"
            aria-label={`current page, ${currentPage} of ${numPages}`}
          />
          <span>/ {numPages}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={goToNextPage} disabled={currentPage >= numPages}>
          <ArrowRight className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleFullscreen} aria-label="Toggle fullscreen">
          {isFullscreen ? <Minimize className="h-5 w-5" /> : <Expand className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
}
