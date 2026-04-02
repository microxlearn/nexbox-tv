
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { cn } from '@/lib/utils';

interface Channel {
  id: string;
  name: string;
  type: string;
  url?: string;
}

interface VideoPlayerProps {
  channel: Channel;
  isPlaying: boolean;
  onNext: () => void;
  onPrev: () => void;
}

export function VideoPlayer({ channel, isPlaying, onNext, onPrev }: VideoPlayerProps) {
  const ytPlayerRef = useRef<any>(null);
  const hlsVideoRef = useRef<HTMLVideoElement>(null);
  const hlsInstanceRef = useRef<Hls | null>(null);
  const volumeTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [volume, setVolume] = useState(100);
  const [showVolumeOverlay, setShowVolumeOverlay] = useState(false);

  const unlockAudio = useCallback(() => {
    if (audioUnlocked) return;
    
    // Attempt to unmute both systems
    if (ytPlayerRef.current && typeof ytPlayerRef.current.unMute === 'function') {
      ytPlayerRef.current.unMute();
      ytPlayerRef.current.setVolume(volume);
    }
    
    if (hlsVideoRef.current) {
      hlsVideoRef.current.muted = false;
      hlsVideoRef.current.volume = volume / 100;
    }
    
    setAudioUnlocked(true);
  }, [audioUnlocked, volume]);

  const updateVolume = useCallback((delta: number) => {
    setVolume((prev) => {
      const nextVolume = Math.min(Math.max(prev + delta, 0), 100);
      
      // Sync to players
      if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === 'function') {
        ytPlayerRef.current.setVolume(nextVolume);
      }
      
      if (hlsVideoRef.current) {
        hlsVideoRef.current.volume = nextVolume / 100;
      }
      
      return nextVolume;
    });

    // Handle transient overlay
    setShowVolumeOverlay(true);
    if (volumeTimerRef.current) clearTimeout(volumeTimerRef.current);
    volumeTimerRef.current = setTimeout(() => setShowVolumeOverlay(false), 3000);
  }, []);

  // Keyboard and Interaction Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      unlockAudio();
      switch (e.key) {
        case 'ArrowUp': e.preventDefault(); updateVolume(10); break;
        case 'ArrowDown': e.preventDefault(); updateVolume(-10); break;
        case 'ArrowRight': onNext(); break;
        case 'ArrowLeft': onPrev(); break;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      unlockAudio();
      if (e.deltaY < 0) updateVolume(10);
      else updateVolume(-10);
    };

    const handleClick = () => {
      unlockAudio();
      onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('click', handleClick);
    };
  }, [onNext, onPrev, unlockAudio, updateVolume]);

  // YouTube API Loader
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadYT = () => {
      if ((window as any).YT && (window as any).YT.Player) {
        createPlayer();
      } else {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        (window as any).onYouTubeIframeAPIReady = createPlayer;
      }
    };

    const createPlayer = () => {
      if (ytPlayerRef.current) return;
      ytPlayerRef.current = new (window as any).YT.Player('yt-player', {
        height: '100%',
        width: '100%',
        videoId: '',
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          mute: 1,
        },
        events: {
          onReady: (event: any) => {
            if (channel.type === 'youtube') {
              event.target.loadVideoById(channel.id);
            }
          },
          onError: () => setTimeout(onNext, 1000)
        },
      });
    };

    loadYT();
  }, []); // Run once

  // Mutual Exclusion and Channel Switching Logic
  useEffect(() => {
    // 1. Reset HLS
    if (hlsInstanceRef.current) {
      hlsInstanceRef.current.destroy();
      hlsInstanceRef.current = null;
    }
    if (hlsVideoRef.current) {
      hlsVideoRef.current.pause();
      hlsVideoRef.current.removeAttribute('src');
      hlsVideoRef.current.load();
    }

    // 2. Switch Context
    if (channel.type === 'youtube') {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
        ytPlayerRef.current.loadVideoById(channel.id);
        if (audioUnlocked) {
          ytPlayerRef.current.unMute();
          ytPlayerRef.current.setVolume(volume);
        }
      }
    } else if (channel.type === 'hls' && channel.url) {
      // STOP YouTube to prevent dual audio
      if (ytPlayerRef.current && typeof ytPlayerRef.current.stopVideo === 'function') {
        ytPlayerRef.current.stopVideo();
      }

      if (Hls.isSupported() && hlsVideoRef.current) {
        const hls = new Hls({
          lowLatencyMode: false,
          liveSyncDuration: 20,
          liveMaxLatencyDuration: 30,
          maxBufferLength: 30,
          enableWorker: true,
        });

        hls.loadSource(channel.url);
        hls.attachMedia(hlsVideoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (isPlaying) hlsVideoRef.current?.play().catch(() => {});
          if (hlsVideoRef.current) {
            hlsVideoRef.current.muted = !audioUnlocked;
            hlsVideoRef.current.volume = volume / 100;
          }
        });
        hlsInstanceRef.current = hls;
      }
    }
  }, [channel.id, channel.type, channel.url]); // Only re-run when channel changes

  return (
    <div className="absolute inset-0 bg-black pointer-events-none overflow-hidden">
      {/* YouTube Layer */}
      <div 
        className={cn(
          "absolute inset-0 transition-opacity duration-1000",
          channel.type === 'youtube' ? "opacity-100" : "opacity-0"
        )}
      >
        <div id="yt-player" className="w-full h-full" />
      </div>

      {/* HLS Layer */}
      <div 
        className={cn(
          "absolute inset-0 transition-opacity duration-1000",
          channel.type === 'hls' ? "opacity-100" : "opacity-0"
        )}
      >
        <video 
          ref={hlsVideoRef}
          className="w-full h-full object-cover"
          playsInline
          muted={!audioUnlocked}
        />
      </div>

      {/* Volume Overlay (Top Right) */}
      <div 
        className={cn(
          "absolute top-10 right-10 z-50 flex items-center gap-4 bg-black/40 px-4 py-2 rounded-lg border border-white/5 backdrop-blur-xl transition-all duration-700 ease-in-out",
          showVolumeOverlay ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        )}
      >
        <div className="h-0.5 w-24 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${volume}%` }} />
        </div>
        <span className="text-[10px] font-mono font-bold text-white/80">{String(volume).padStart(3, '0')}</span>
      </div>

      {/* Initial Interaction Prompt */}
      {!audioUnlocked && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.6em] animate-pulse">
            PRESS ANY KEY TO ACTIVATE
          </p>
        </div>
      )}
    </div>
  );
}
