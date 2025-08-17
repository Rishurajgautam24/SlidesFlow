'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import type { PDFPageProxy, RenderTask } from 'pdfjs-dist';
import { usePresentation, Annotation, PathPoint } from './PresentationContext';
import { useWindowSize } from '@/hooks/useWindowSize';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SlideViewer() {
    const { 
        pdf, currentPage, activeTool, goToNextPage, goToPrevPage, annotations, 
        addAnnotation, updateLastAnnotation, penColor, penWidth, eraseStroke
    } = usePresentation();
    const [page, setPage] = useState<PDFPageProxy | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
    const annotationCanvasRef = useRef<HTMLCanvasElement>(null);
    const laserRef = useRef<HTMLDivElement>(null);
    const renderTaskRef = useRef<RenderTask | null>(null);
    
    const [isDrawing, setIsDrawing] = useState(false);
    
    const windowSize = useWindowSize();

    useEffect(() => {
        const loadPage = async () => {
            if (!pdf) return;
            setIsLoading(true);
            if (renderTaskRef.current) {
                renderTaskRef.current.cancel();
            }
            try {
                const loadedPage = await pdf.getPage(currentPage);
                setPage(loadedPage);
            } catch (error) {
                console.error("Error loading page:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadPage();
    }, [pdf, currentPage]);

    const drawAnnotations = useCallback(() => {
        const canvas = annotationCanvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        
        const dpr = window.devicePixelRatio || 1;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const pageAnnotations = annotations[currentPage] || [];
        pageAnnotations.forEach(anno => {
            if (anno.type === 'path') {
                ctx.beginPath();
                ctx.strokeStyle = anno.color;
                ctx.lineWidth = anno.width;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.globalCompositeOperation = anno.isHighlighter ? 'multiply' : 'source-over';

                anno.points.forEach((p, i) => {
                    if (i === 0) {
                        ctx.moveTo(p.x * (canvas.width / dpr), p.y * (canvas.height / dpr));
                    } else {
                        ctx.lineTo(p.x * (canvas.width / dpr), p.y * (canvas.height / dpr));
                    }
                });
                ctx.stroke();
            }
        });
        ctx.globalCompositeOperation = 'source-over';
    }, [annotations, currentPage]);

    useEffect(() => {
        if (isLoading || !page || !containerRef.current || !pdfCanvasRef.current || !annotationCanvasRef.current) return;

        if (renderTaskRef.current) {
            renderTaskRef.current.cancel();
        }

        const container = containerRef.current;
        const pdfCanvas = pdfCanvasRef.current;
        const annotationCanvas = annotationCanvasRef.current;
        
        const dpr = window.devicePixelRatio || 1;
        const containerRect = container.getBoundingClientRect();

        const viewport = page.getViewport({ scale: 1 });
        const scale = Math.min(containerRect.width / viewport.width, containerRect.height / viewport.height) * 0.95;
        const scaledViewport = page.getViewport({ scale: scale * dpr });
        
        pdfCanvas.width = annotationCanvas.width = scaledViewport.width;
        pdfCanvas.height = annotationCanvas.height = scaledViewport.height;

        pdfCanvas.style.width = annotationCanvas.style.width = `${scaledViewport.width / dpr}px`;
        pdfCanvas.style.height = annotationCanvas.style.height = `${scaledViewport.height / dpr}px`;
        
        const annotationCtx = annotationCanvas.getContext('2d');
        if (annotationCtx) {
          annotationCtx.scale(dpr, dpr);
        }

        const pdfCtx = pdfCanvas.getContext('2d');
        if (pdfCtx) {
            const renderContext = {
              canvasContext: pdfCtx,
              viewport: scaledViewport,
            };
            renderTaskRef.current = page.render(renderContext);
            renderTaskRef.current.promise.catch(err => {
              if (err.name !== 'RenderingCancelledException') {
                console.error('Render error:', err);
              }
            });
        }

        drawAnnotations();

    }, [page, isLoading, windowSize, drawAnnotations]);

    useEffect(() => {
        drawAnnotations();
    }, [annotations, drawAnnotations]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.target as HTMLElement).tagName === 'INPUT') return;
            if (e.key === 'ArrowRight' || e.key === ' ') {
                goToNextPage();
            } else if (e.key === 'ArrowLeft') {
                goToPrevPage();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goToNextPage, goToPrevPage]);
    
    const getCoords = (e: React.MouseEvent): PathPoint | null => {
        const canvas = annotationCanvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) / rect.width,
            y: (e.clientY - rect.top) / rect.height,
        };
    };

    const startDrawing = (e: React.MouseEvent) => {
        if (activeTool !== 'pen' && activeTool !== 'highlighter') return;
        const coords = getCoords(e);
        if (!coords) return;
        
        setIsDrawing(true);
        
        const newAnnotation: Annotation = {
            id: new Date().toISOString(),
            type: 'path',
            color: activeTool === 'highlighter' ? 'rgba(250, 204, 21, 0.5)' : penColor,
            width: activeTool === 'highlighter' ? 15 : penWidth,
            points: [coords],
            isHighlighter: activeTool === 'highlighter',
        };
        addAnnotation(currentPage, newAnnotation);
    };

    const draw = (e: React.MouseEvent) => {
        if (!isDrawing) return;
        const coords = getCoords(e);
        if (!coords) return;
        
        updateLastAnnotation(currentPage, coords);
    };

    const stopDrawing = () => {
        if (isDrawing) {
          setIsDrawing(false);
        }
    };

    const handleMouseClick = (e: React.MouseEvent) => {
        if (activeTool === 'eraser') {
            const coords = getCoords(e);
            if (!coords) return;
            eraseStroke(currentPage, coords);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      const laser = laserRef.current;
      if (activeTool === 'laser' && laser) {
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (containerRect) {
            laser.style.left = `${e.clientX - containerRect.left}px`;
            laser.style.top = `${e.clientY - containerRect.top}px`;
        }
      }

      if(isDrawing) draw(e);
    };

    return (
        <div ref={containerRef} className="flex-1 flex items-center justify-center p-4 overflow-hidden" onMouseMove={handleMouseMove}>
            {isLoading ? (
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            ) : (
                <div className="relative shadow-lg"
                     onMouseDown={startDrawing}
                     onMouseUp={stopDrawing}
                     onMouseLeave={stopDrawing}
                     onClick={handleMouseClick}
                     style={{ cursor: activeTool === 'cursor' || activeTool === 'laser' ? 'default' : (activeTool === 'eraser' ? 'cell' : 'crosshair') }}
                >
                    <canvas ref={pdfCanvasRef} />
                    <canvas ref={annotationCanvasRef} className="absolute top-0 left-0" />
                </div>
            )}
            <div 
                ref={laserRef} 
                className={cn(
                    "absolute w-4 h-4 bg-red-500 rounded-full shadow-lg border-2 border-white pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-opacity",
                    activeTool === 'laser' ? 'opacity-100' : 'opacity-0'
                )} 
            />
            <div className={cn("absolute inset-0", {
                'cursor-none': activeTool === 'laser',
            })}></div>
        </div>
    );
}
