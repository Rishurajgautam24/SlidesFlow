'use client';

import { Button } from "@/components/ui/button";
import { LogOut, Download } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function Header({ onExit }: { onExit: () => void }) {
  const { toast } = useToast();
  
  const handleExport = async () => {
    toast({
        title: "Feature in development",
        description: "Exporting PDFs with annotations is coming soon!",
    });
  };

  return (
    <header className="flex items-center justify-between p-2 bg-background border-b z-30 shadow-sm flex-shrink-0">
      <h1 className="text-xl font-bold text-primary">SlideFlow</h1>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export as PDF
        </Button>
        <Button variant="outline" size="sm" onClick={onExit}>
          <LogOut className="mr-2 h-4 w-4" />
          Exit
        </Button>
      </div>
    </header>
  );
}
