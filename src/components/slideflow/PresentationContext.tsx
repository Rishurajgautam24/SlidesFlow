'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';

export type Tool = 'cursor' | 'pen' | 'highlighter' | 'eraser' | 'laser';

export interface PathPoint {
  x: number;
  y: number;
}
export interface Annotation {
  id: string;
  type: 'path';
  points: PathPoint[];
  color: string;
  width: number;
  isHighlighter?: boolean;
}

interface PresentationState {
  pdf: PDFDocumentProxy;
  numPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
  
  penColor: string;
  setPenColor: (color: string) => void;
  penWidth: number;
  setPenWidth: (width: number) => void;
  
  annotations: Record<number, Annotation[]>;
  addAnnotation: (page: number, annotation: Annotation) => void;
  updateLastAnnotation: (page: number, point: PathPoint) => void;
  undoAnnotation: (page: number) => void;
  clearAnnotations: (page: number) => void;
  eraseStroke: (page: number, point: PathPoint) => void;

  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

const PresentationContext = createContext<PresentationState | undefined>(undefined);

export const usePresentation = () => {
  const context = useContext(PresentationContext);
  if (!context) {
    throw new Error('usePresentation must be used within a PresentationProvider');
  }
  return context;
};

export const PresentationProvider = ({ pdf, children }: { pdf: PDFDocumentProxy, children: ReactNode }) => {
  const [currentPage, _setCurrentPage] = useState(1);
  const [activeTool, setActiveTool] = useState<Tool>('cursor');
  const [penColor, setPenColor] = useState('#EF4444'); // red-500
  const [penWidth, setPenWidth] = useState(3);
  const [annotations, setAnnotations] = useState<Record<number, Annotation[]>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const numPages = pdf.numPages;

  const setCurrentPage = useCallback((page: number) => {
    if (page >= 1 && page <= numPages) {
      _setCurrentPage(page);
    }
  }, [numPages]);

  const goToNextPage = useCallback(() => {
    setCurrentPage(currentPage + 1);
  }, [currentPage, setCurrentPage]);
  
  const goToPrevPage = useCallback(() => {
    setCurrentPage(currentPage - 1);
  }, [currentPage, setCurrentPage]);
  
  const addAnnotation = useCallback((page: number, annotation: Annotation) => {
    setAnnotations(prev => ({
      ...prev,
      [page]: [...(prev[page] || []), annotation],
    }));
  }, []);

  const updateLastAnnotation = useCallback((page: number, point: PathPoint) => {
    setAnnotations(prev => {
      const pageAnnotations = prev[page] || [];
      if (pageAnnotations.length === 0) return prev;
      const lastAnnotation = pageAnnotations[pageAnnotations.length - 1];
      const updatedPoints = [...lastAnnotation.points, point];
      const updatedAnnotation = { ...lastAnnotation, points: updatedPoints };
      return {
        ...prev,
        [page]: [...pageAnnotations.slice(0, -1), updatedAnnotation],
      }
    });
  }, []);
  
  const undoAnnotation = useCallback((page: number) => {
    setAnnotations(prev => {
      const pageAnnotations = prev[page] || [];
      if (pageAnnotations.length === 0) return prev;
      return {
        ...prev,
        [page]: pageAnnotations.slice(0, -1),
      };
    });
  }, []);

  const clearAnnotations = useCallback((page: number) => {
    setAnnotations(prev => ({
      ...prev,
      [page]: [],
    }));
  }, []);

  const eraseStroke = useCallback((page: number, point: PathPoint) => {
    setAnnotations(prev => {
      const pageAnnotations = prev[page] || [];
      if (pageAnnotations.length === 0) return prev;

      let annotationToDelete: Annotation | null = null;
      let minDistance = Infinity;

      for (const annotation of pageAnnotations) {
        if (annotation.type !== 'path') continue;

        for (const p of annotation.points) {
          const distance = Math.sqrt(Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2));
          if (distance < minDistance) {
            minDistance = distance;
            annotationToDelete = annotation;
          }
        }
      }

      // 0.05 is a magic number for tolerance, approx 5% of canvas dimension
      if (annotationToDelete && minDistance < 0.05) {
        return {
          ...prev,
          [page]: pageAnnotations.filter(a => a.id !== annotationToDelete!.id),
        };
      }

      return prev;
    });
  }, []);


  const value = {
    pdf,
    numPages,
    currentPage,
    setCurrentPage,
    goToNextPage,
    goToPrevPage,
    activeTool,
    setActiveTool,
    penColor,
    setPenColor,
    penWidth,
    setPenWidth,
    annotations,
    addAnnotation,
    updateLastAnnotation,
    undoAnnotation,
    clearAnnotations,
    eraseStroke,
    isFullscreen,
    toggleFullscreen,
  };

  return <PresentationContext.Provider value={value}>{children}</PresentationContext.Provider>;
};
