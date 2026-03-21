'use client';

import React from 'react';
import { ChevronRight, ChevronLeft, Menu, Volume2, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RemoteControlsProps {
  onNext: () => void;
  onPrev: () => void;
  onToggleOverlay: () => void;
  onTogglePlay: () => void;
  isPlaying: boolean;
  showOverlay: boolean;
}

export function RemoteControls({ 
  onNext, 
  onPrev, 
  onToggleOverlay, 
  onTogglePlay,
  isPlaying,
  showOverlay 
}: RemoteControlsProps) {
  return (
    <div className="absolute bottom-12 right-12 z-50 flex flex-col items-end gap-6 pointer-events-auto">
      {/* Status indicator for sound */}
      <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-bold text-accent uppercase tracking-widest">
        <Volume2 className="w-3 h-3 text-primary" />
        <span>Audio Enabled</span>
      </div>

      <div className="flex gap-4">
        {/* Play/Pause Button */}
        <button
          onClick={onTogglePlay}
          className={cn(
            "w-16 h-16 rounded-full glass-morphism flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group",
            !isPlaying ? "bg-primary text-white border-primary shadow-[0_0_15px_rgba(38,126,242,0.5)]" : "text-white/80"
          )}
          title={isPlaying ? "Pause (Space)" : "Play (Space)"}
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black/80 text-[10px] px-2 py-1 rounded text-white whitespace-nowrap transition-opacity uppercase font-bold">
            {isPlaying ? 'Pause' : 'Play'}
          </span>
        </button>

        <button
          onClick={onToggleOverlay}
          className={cn(
            "w-16 h-16 rounded-full glass-morphism flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group",
            showOverlay ? "bg-primary text-white border-primary" : "text-white/80"
          )}
          title="Toggle Menu (Enter)"
        >
          <Menu className={cn("w-6 h-6 transition-transform duration-300", showOverlay && "rotate-90")} />
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black/80 text-[10px] px-2 py-1 rounded text-white whitespace-nowrap transition-opacity font-bold">OK / MENU</span>
        </button>

        <div className="flex gap-2">
          <button
            onClick={onPrev}
            className="w-16 h-16 rounded-full glass-morphism flex items-center justify-center text-white/80 transition-all duration-300 hover:scale-110 active:scale-95 group"
            title="Previous Channel (Left Arrow)"
          >
            <ChevronLeft className="w-8 h-8" />
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black/80 text-[10px] px-2 py-1 rounded text-white whitespace-nowrap transition-opacity font-bold uppercase">Prev</span>
          </button>

          <button
            onClick={onNext}
            className="w-16 h-16 rounded-full glass-morphism flex items-center justify-center text-white/80 transition-all duration-300 hover:scale-110 active:scale-95 group"
            title="Next Channel (Right Arrow)"
          >
            <ChevronRight className="w-8 h-8" />
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black/80 text-[10px] px-2 py-1 rounded text-white whitespace-nowrap transition-opacity font-bold uppercase">Next</span>
          </button>
        </div>
      </div>
    </div>
  );
}
