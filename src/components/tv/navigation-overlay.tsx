
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2, Zap } from 'lucide-react';
import { CHANNELS } from './tv-interface';

interface NavigationOverlayProps {
  visible: boolean;
  currentChannel: typeof CHANNELS[0];
  channelIndex: number;
  totalChannels: number;
  newsBrief: string | null;
  isLoadingBrief: boolean;
  onSelectChannel: (index: number) => void;
}

export function NavigationOverlay({
  visible,
  currentChannel,
  channelIndex,
  totalChannels,
  newsBrief,
  isLoadingBrief,
  onSelectChannel,
}: NavigationOverlayProps) {
  return (
    <div
      className={cn(
        'absolute bottom-0 left-0 right-0 z-40 tv-overlay-gradient pt-32 pb-12 px-12 transition-all duration-500 ease-in-out transform',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      )}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="bg-primary text-white text-sm font-bold px-2 py-0.5 rounded">LIVE</span>
              <span className="text-accent font-semibold tracking-wider">CH {channelIndex + 1} / {totalChannels}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">{currentChannel.name}</h1>
          </div>

          <div className="glass-morphism rounded-2xl p-6 max-w-xl w-full border-l-4 border-l-primary">
            <div className="flex items-center gap-2 mb-2 text-accent">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">AI News Brief</span>
            </div>
            {isLoadingBrief ? (
              <div className="flex items-center gap-3 text-white/50 py-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm italic">Analyzing current broadcast...</span>
              </div>
            ) : (
              <p className="text-white/90 text-sm leading-relaxed">
                {newsBrief || "Switching to current channel's summary..."}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {CHANNELS.map((channel, idx) => (
            <button
              key={channel.id}
              onClick={() => onSelectChannel(idx)}
              className={cn(
                'group relative aspect-video rounded-xl overflow-hidden border-2 transition-all duration-300',
                idx === channelIndex 
                  ? 'border-primary shadow-[0_0_20px_rgba(38,126,242,0.4)] scale-105' 
                  : 'border-white/10 hover:border-white/40 grayscale hover:grayscale-0'
              )}
            >
              <img 
                src={`https://picsum.photos/seed/${channel.logoSeed}/320/180`} 
                alt={channel.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                data-ai-hint="news channel"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
                <span className="text-xs font-bold text-white uppercase truncate">{channel.name}</span>
              </div>
              {idx === channelIndex && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
