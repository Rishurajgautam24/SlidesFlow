'use client';
import { useState, useEffect } from 'react';
import { Clock, Timer, Play, Pause, RotateCcw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

export default function TimerClock() {
    const [time, setTime] = useState(new Date());
    const [timer, setTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    useEffect(() => {
        const clockInterval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(clockInterval);
    }, []);

    useEffect(() => {
        let timerInterval: NodeJS.Timeout | undefined;
        if (isTimerRunning) {
            timerInterval = setInterval(() => setTimer(prev => prev + 1), 1000);
        }
        return () => {
            if (timerInterval) clearInterval(timerInterval);
        }
    }, [isTimerRunning]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    }

    const resetTimer = () => {
      setIsTimerRunning(false);
      setTimer(0);
    }
    
    return (
        <Tabs defaultValue="timer" className="flex items-center gap-2">
            <TabsList className="h-8">
                <TabsTrigger value="clock" className="h-6 px-2"><Clock className="h-4 w-4"/></TabsTrigger>
                <TabsTrigger value="timer" className="h-6 px-2"><Timer className="h-4 w-4"/></TabsTrigger>
            </TabsList>
            <TabsContent value="clock" className="m-0 font-mono text-sm min-w-[70px] text-center">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </TabsContent>
            <TabsContent value="timer" className="m-0 flex items-center gap-1">
                <span className="font-mono text-sm min-w-[70px] text-center">{formatTime(timer)}</span>
                <Button aria-label={isTimerRunning ? 'Pause timer' : 'Start timer'} variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsTimerRunning(prev => !prev)}>
                    {isTimerRunning ? <Pause className="h-4 w-4"/> : <Play className="h-4 w-4"/>}
                </Button>
                <Button aria-label="Reset timer" variant="ghost" size="icon" className="h-6 w-6" onClick={resetTimer}>
                    <RotateCcw className="h-4 w-4"/>
                </Button>
            </TabsContent>
        </Tabs>
    );
}
