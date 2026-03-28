"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CounterCardProps {
  name: string;
  count: number;
  total: number;
  onIncrement: () => void;
  isLoading?: boolean;
}

export function CounterCard({ name, count, total, onIncrement, isLoading }: CounterCardProps) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  const isLeading = total > 0 && count > total - count;
  
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50">
      {isLeading && (
        <div className="absolute top-3 right-3">
          <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
            Leading
          </span>
        </div>
      )}
      
      <h2 className="text-xl font-semibold text-foreground">{name}</h2>
      
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-5xl font-bold text-primary tabular-nums">{count}</span>
        <span className="text-muted-foreground">mentions</span>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between text-sm text-muted-foreground mb-1.5">
          <span>Share</span>
          <span>{percentage}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      
      <Button 
        onClick={onIncrement} 
        className="mt-6 w-full"
        disabled={isLoading}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Mention
      </Button>
    </div>
  );
}
