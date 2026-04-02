
'use client';

import React, { useState, useEffect } from 'react';
import { VideoPlayer } from './video-player';
import { cn } from '@/lib/utils';

export const CHANNELS = [
  { id: '1wECsnGZcfc', name: '24 News', type: 'youtube' },
  { id: '4wExBtPQ-JA', name: 'Asianet News', type: 'youtube' },
  { id: 'nObUcHKZEGY', name: 'Reporter TV', type: 'youtube' },
  { id: 'YGEgelAiUf0', name: 'Mathrubhumi News', type: 'youtube' },
  { id: '7Y-MMzEcjeA', name: 'News18 Kerala', type: 'youtube' },
  { id: 'tgBTspqA5nY', name: 'Manorama News', type: 'youtube' },
  { 
    id: 'flowers-tv', 
    name: 'Flowers TV', 
    type: 'hls', 
    url: 'https://yuppmedtaorire.akamaized.net/v1/master/a0d007312bfd99c47f76b77ae26b1ccdaae76cb1/flowers_nim_https/050522/flowers/playlist.m3u8'
  }
];

export function TVInterface() {
  const [currentChannelIndex, setCurrentChannelIndex] = useState(0);
  const [showIndicator, setShowIndicator] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  const currentChannel = CHANNELS[currentChannelIndex];

  // Handle transient channel indicator
  useEffect(() => {
    setShowIndicator(true);
    const timeout = setTimeout(() => setShowIndicator(false), 3000);
    return () => clearTimeout(timeout);
  }, [currentChannelIndex]);

  const handleNext = () => setCurrentChannelIndex((prev) => (prev + 1) % CHANNELS.length);
  const handlePrev = () => setCurrentChannelIndex((prev) => (prev - 1 + CHANNELS.length) % CHANNELS.length);

  return (
    <div className="h-screen w-screen bg-black overflow-hidden relative select-none">
      <VideoPlayer 
        channel={currentChannel} 
        isPlaying={isPlaying}
        onNext={handleNext}
        onPrev={handlePrev}
      />
      
      {/* Channel Info Indicator (Bottom Left) */}
      <div 
        className={cn(
          "absolute bottom-10 left-10 z-50 transition-all duration-700 ease-in-out transform pointer-events-none",
          showIndicator ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-6 py-3 rounded-xl shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded tracking-tighter">
              LIVE
            </div>
            <div className="flex flex-col">
              <span className="text-white text-2xl font-bold tracking-tight uppercase">
                {currentChannel.name}
              </span>
              <span className="text-primary text-[10px] font-bold tracking-[0.3em] uppercase opacity-80">
                Channel {currentChannelIndex + 1} of {CHANNELS.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
