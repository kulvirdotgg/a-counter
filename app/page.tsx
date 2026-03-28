"use client";

import { useState, useCallback } from "react";
import useSWR, { mutate } from "swr";
import { CounterCard } from "@/components/counter-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotateCcw } from "lucide-react";

interface Counts {
  "Mumbai Indians": number;
  "Kanye West": number;
  total: number;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Home() {
  const [timeframe, setTimeframe] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  
  const apiUrl = timeframe === "all" ? "/api/counts" : `/api/counts?timeframe=${timeframe}`;
  const { data: counts, isLoading: isFetching } = useSWR<Counts>(apiUrl, fetcher, {
    refreshInterval: 5000,
  });
  
  const handleIncrement = useCallback(async (name: string) => {
    setIsLoading(true);
    try {
      await fetch("/api/increment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      mutate(apiUrl);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl]);
  
  const handleReset = useCallback(async () => {
    if (!confirm("Are you sure you want to reset all counts?")) return;
    
    setIsLoading(true);
    try {
      await fetch("/api/reset", { method: "POST" });
      mutate(apiUrl);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl]);
  
  const mumbaiCount = counts?.["Mumbai Indians"] ?? 0;
  const kanyeCount = counts?.["Kanye West"] ?? 0;
  const total = counts?.total ?? 0;
  
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <header className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground">Mention Counter</h1>
          <p className="mt-2 text-muted-foreground">
            Track how often you mention Mumbai Indians vs Kanye West
          </p>
        </header>
        
        <div className="mb-8 flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Timeframe:</span>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="60">Last hour</SelectItem>
                <SelectItem value="1440">Last 24 hours</SelectItem>
                <SelectItem value="10080">Last 7 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline" size="sm" onClick={handleReset} disabled={isLoading}>
            <RotateCcw className="mr-2 h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2">
          <CounterCard
            name="Mumbai Indians"
            count={mumbaiCount}
            total={total}
            onIncrement={() => handleIncrement("Mumbai Indians")}
            isLoading={isLoading || isFetching}
          />
          <CounterCard
            name="Kanye West"
            count={kanyeCount}
            total={total}
            onIncrement={() => handleIncrement("Kanye West")}
            isLoading={isLoading || isFetching}
          />
        </div>
        
        {total > 0 && (
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Total mentions: <span className="font-semibold text-foreground">{total}</span>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
