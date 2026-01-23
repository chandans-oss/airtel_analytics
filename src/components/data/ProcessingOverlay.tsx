import { Loader2, Database } from 'lucide-react';

export function ProcessingOverlay() {
  return (
    <div className="processing-overlay">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-primary/20 animate-pulse-glow" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Database size={32} className="text-primary" />
          </div>
          <Loader2 
            size={80} 
            className="absolute inset-0 text-primary/30 animate-spin-slow" 
          />
        </div>
        
        <div className="text-center">
          <h2 className="text-xl font-semibold">Processing Inventory Data</h2>
          <p className="mt-2 text-muted-foreground">
            Please wait while we process your data
          </p>
        </div>
        
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-primary animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
