'use client';

import { MousePointer, Pen, Highlighter, Eraser, Undo, Trash2, MousePointer2 } from 'lucide-react';
import { usePresentation, Tool } from './PresentationContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const tools: { name: Tool, icon: React.ElementType, label: string }[] = [
    { name: 'cursor', icon: MousePointer, label: 'Select Tool' },
    { name: 'laser', icon: MousePointer2, label: 'Laser Pointer' },
    { name: 'pen', icon: Pen, label: 'Pen Tool' },
    { name: 'highlighter', icon: Highlighter, label: 'Highlighter Tool' },
];

const colors = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#000000'];
const widths = [2, 3, 5, 8];

export default function Toolbar() {
    const { activeTool, setActiveTool, penColor, setPenColor, penWidth, setPenWidth, undoAnnotation, clearAnnotations, currentPage, eraseStroke } = usePresentation();

    const handleEraseStroke = () => {
        setActiveTool('eraser');
    };

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
            <div className="flex items-center gap-1 p-1 bg-background rounded-lg shadow-lg border">
                {tools.map(tool => (
                    <Button
                        key={tool.name}
                        variant={activeTool === tool.name ? 'secondary' : 'ghost'}
                        size="icon"
                        onClick={() => setActiveTool(tool.name)}
                        aria-label={tool.label}
                        title={tool.label}
                    >
                        <tool.icon className="h-5 w-5" />
                    </Button>
                ))}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant={activeTool === 'eraser' ? 'secondary' : 'ghost'}
                            size="icon"
                            aria-label="Eraser Tool"
                            title="Eraser Tool"
                            onClick={() => setActiveTool('eraser')}
                        >
                            <Eraser className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={handleEraseStroke}>
                            Erase Stroke
                        </DropdownMenuItem>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-destructive">
                                    Clear Slide
                                </div>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action will permanently delete all annotations from the current slide. This cannot be undone.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => clearAnnotations(currentPage)}>
                                    Clear Annotations
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
                
                <Separator orientation="vertical" className="h-6 mx-1" />

                {(activeTool === 'pen' || activeTool === 'highlighter') && (
                  <>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Select color" title="Select color">
                                <div className="w-5 h-5 rounded-full border-2" style={{ backgroundColor: penColor }} />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2">
                            <div className="grid grid-cols-4 gap-1">
                                {colors.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setPenColor(color)}
                                        className={cn('w-6 h-6 rounded-full border-2 transition-transform hover:scale-110', penColor === color ? 'border-primary' : 'border-transparent')}
                                        style={{ backgroundColor: color }}
                                        aria-label={`color ${color}`}
                                    />
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Select line width" title="Select line width">
                                <span className="font-bold">{penWidth}</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2">
                            <div className="flex flex-col gap-2">
                                {widths.map(width => (
                                    <button
                                        key={width}
                                        onClick={() => setPenWidth(width)}
                                        className={cn('p-2 rounded-md hover:bg-accent flex items-center gap-2 w-full text-left', penWidth === width && 'bg-accent')}
                                    >
                                        <div className="bg-foreground rounded-full" style={{ height: `${width}px`, width: '24px' }}></div>
                                        <span>{width}px</span>
                                    </button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                  </>
                )}

                <Separator orientation="vertical" className="h-6 mx-1" />

                <Button variant="ghost" size="icon" onClick={() => undoAnnotation(currentPage)} aria-label="Undo last annotation" title="Undo">
                    <Undo className="h-5 w-5" />
                </Button>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" aria-label="Clear all annotations on this slide" title="Clear slide">
                            <Trash2 className="h-5 w-5" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will permanently delete all annotations from the current slide. This cannot be undone.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => clearAnnotations(currentPage)}>
                            Clear Annotations
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
