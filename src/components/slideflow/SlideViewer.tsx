'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import type { PDFPageProxy, RenderTask } from 'pdfjs-dist';
import { usePresentation, Annotation, PathPoint, Tool, TextAnnotation, ShapeAnnotation, PathAnnotation } from './PresentationContext';
import { useWindowSize } from '@/hooks/useWindowSize';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '../ui/button';

export default function SlideViewer() {
    const { 
        pdf, currentPage, activeTool, goToNextPage, goToPrevPage, annotations, 
        addAnnotation, updateLastAnnotation, penColor, penWidth, eraseStroke, setActiveTool
    } = usePresentation();
    const [page, setPage] = useState<PDFPageProxy | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
    const annotationCanvasRef = useRef<HTMLCanvasElement>(null);
    const laserRef = useRef<HTMLDivElement>(null);
    const renderTaskRef = useRef<RenderTask | null>(null);
    
    const [isDrawing, setIsDrawing] = useState(false);
    const [textInput, setTextInput] = useState<{point: PathPoint, value: string} | null>(null);
    
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

    const drawArrow = (ctx: CanvasRenderingContext2D, from: PathPoint, to: PathPoint, width: number, color: string) => {
        const headlen = 10 * (width / 2); // length of head in pixels
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const angle = Math.atan2(dy, dx);
        
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(to.x, to.y);
        ctx.lineTo(to.x - headlen * Math.cos(angle - Math.PI / 6), to.y - headlen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(to.x - headlen * Math.cos(angle + Math.PI / 6), to.y - headlen * Math.sin(angle + Math.PI / 6));
        ctx.lineTo(to.x, to.y);
        ctx.fillStyle = color;
        ctx.fill();
    };

    const drawAnnotations = useCallback(() => {
        const canvas = annotationCanvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        
        const dpr = window.devicePixelRatio || 1;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const pageAnnotations = annotations[currentPage] || [];
        pageAnnotations.forEach(anno => {
            const canvasWidth = canvas.width / dpr;
            const canvasHeight = canvas.height / dpr;

            if (anno.type === 'path') {
                ctx.beginPath();
                ctx.strokeStyle = anno.color;
                ctx.lineWidth = anno.width;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.globalCompositeOperation = anno.isHighlighter ? 'multiply' : 'source-over';

                anno.points.forEach((p, i) => {
                    const x = p.x * canvasWidth;
                    const y = p.y * canvasHeight;
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                });
                ctx.stroke();
            } else if (anno.type === 'text') {
                ctx.font = `${anno.size * canvasHeight}px Inter`;
                ctx.fillStyle = anno.color;
                ctx.globalCompositeOperation = 'source-over';
                ctx.fillText(anno.text, anno.point.x * canvasWidth, anno.point.y * canvasHeight);
            } else if (anno.type === 'shape') {
                ctx.beginPath();
                ctx.strokeStyle = anno.color;
                ctx.lineWidth = anno.width;
                ctx.globalCompositeOperation = 'source-over';
                const startX = anno.start.x * canvasWidth;
                const startY = anno.start.y * canvasHeight;
                const endX = anno.end.x * canvasWidth;
                const endY = anno.end.y * canvasHeight;

                if (anno.shape === 'rectangle') {
                    ctx.strokeRect(startX, startY, endX - startX, endY - startY);
                } else if (anno.shape === 'circle') {
                    const radiusX = Math.abs(endX - startX) / 2;
                    const radiusY = Math.abs(endY - startY) / 2;
                    const centerX = startX + radiusX;
                    const centerY = startY + radiusY;
                    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
                    ctx.stroke();
                } else if (anno.shape === 'arrow') {
                    drawArrow(ctx, { x: startX, y: startY }, { x: endX, y: endY }, anno.width, anno.color);
                }
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

    const isDrawingTool = (tool: Tool) => {
      return ['pen', 'highlighter', 'rectangle', 'circle', 'arrow'].includes(tool);
    }

    const startDrawing = (e: React.MouseEvent) => {
        if (!isDrawingTool(activeTool)) return;
        const coords = getCoords(e);
        if (!coords) return;
        
        setIsDrawing(true);

        let newAnnotation: Annotation;

        if (activeTool === 'pen' || activeTool === 'highlighter') {
            newAnnotation = {
                id: new Date().toISOString(),
                type: 'path',
                color: activeTool === 'highlighter' ? 'rgba(250, 204, 21, 0.5)' : penColor,
                width: activeTool === 'highlighter' ? 15 : penWidth,
                points: [coords],
                isHighlighter: activeTool === 'highlighter',
            } as PathAnnotation;
        } else {
             newAnnotation = {
                id: new Date().toISOString(),
                type: 'shape',
                shape: activeTool as 'rectangle' | 'circle' | 'arrow',
                color: penColor,
                width: penWidth,
                start: coords,
                end: coords,
             } as ShapeAnnotation;
        }
        
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
        const coords = getCoords(e);
        if (!coords) return;

        if (activeTool === 'eraser') {
            eraseStroke(currentPage, coords);
        } else if (activeTool === 'text') {
            setTextInput({ point: coords, value: '' });
        }
    };
    
    const handleTextSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (textInput && textInput.value.trim() !== '') {
            const newAnnotation: TextAnnotation = {
                id: new Date().toISOString(),
                type: 'text',
                text: textInput.value,
                point: textInput.point,
                color: penColor,
                width: penWidth, // not used for text, but for consistency
                size: 0.04, // 4% of canvas height
            };
            addAnnotation(currentPage, newAnnotation);
        }
        setTextInput(null);
        setActiveTool('cursor');
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

    const getCursor = () => {
        if (isDrawingTool(activeTool) || activeTool === 'text') return 'crosshair';
        if (activeTool === 'eraser') return 'cursor-eraser';
        if (activeTool === 'laser') return 'none';
        return 'default';
    }

    return (
        <div ref={containerRef} className="flex-1 flex items-center justify-center p-4 overflow-hidden relative">
            {isLoading ? (
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            ) : (
                <div className="relative shadow-lg"
                     style={{ cursor: getCursor() }}
                     onMouseMove={handleMouseMove}
                     onMouseDown={startDrawing}
                     onMouseUp={stopDrawing}
                     onMouseLeave={stopDrawing}
                     onClick={handleMouseClick}
                >
                    <canvas ref={pdfCanvasRef} />
                    <canvas 
                        ref={annotationCanvasRef} 
                        className="absolute top-0 left-0"
                    />
                     {textInput && annotationCanvasRef.current && (
                        <form
                            onSubmit={handleTextSubmit}
                            style={{
                                position: 'absolute',
                                left: `${textInput.point.x * annotationCanvasRef.current.clientWidth}px`,
                                top: `${textInput.point.y * annotationCanvasRef.current.clientHeight}px`,
                            }}
                        >
                            <Input
                                type="text"
                                autoFocus
                                value={textInput.value}
                                onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
                                onBlur={() => handleTextSubmit()}
                                className="h-8 bg-background/80 backdrop-blur-sm"
                                style={{
                                    fontSize: `${0.04 * annotationCanvasRef.current.clientHeight}px`,
                                    color: penColor,
                                }}
                            />
                        </form>
                    )}
                </div>
            )}
            <div 
                ref={laserRef} 
                className={cn(
                    "absolute w-4 h-4 bg-red-500 rounded-full shadow-lg border-2 border-white pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-opacity",
                    activeTool === 'laser' ? 'opacity-100' : 'opacity-0'
                )} 
            />
        </div>
    );
}
