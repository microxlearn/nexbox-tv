
'use client';

import React, { useEffect, useRef } from 'react';

/**
 * Pure Full-Screen TV Player with YouTube Iframe API
 * 
 * Controls:
 * - Mouse Scroll Up/Down: Volume +/- 10 (Debounced)
 * - Left Click: Next Channel
 * - Keyboard Left/Right: Prev/Next Channel
 * - Keyboard Up/Down: Volume +/- 10
 * 
 * Features:
 * - Circular channel looping
 * - Automatic error skipping
 * - Interaction-based audio unlocking
 * - Zero UI overlay
 */
export function VideoPlayer() {
  const playerRef = useRef<any>(null);
  const audioUnlockedRef = useRef(false);
  const lastSwitchTimeRef = useRef(0);
  const currentIndexRef = useRef(0);
  const volumeDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Validated Live Channel IDs
  const CHANNEL_IDS = [
    '1wECsnGZcfc', // 24 NEWS
    '4wExBtPQ-JA', // ASIANET NEWS
    'nObUcHKZEGY', // REPORTER TV
    'YGEgelAiUf0', // MATHRUBHUMI NEWS
    '7Y-MMzEcjeA', // NEWS18 KERALA
    'tgBTspqA5nY'  // MANORAMA NEWS
  ];

  const switchChannel = (direction: 'next' | 'prev') => {
    const now = Date.now();
    // Debounce to prevent rapid switching and API spam
    if (now - lastSwitchTimeRef.current < 800) return;
    lastSwitchTimeRef.current = now;

    if (direction === 'next') {
      currentIndexRef.current = (currentIndexRef.current + 1) % CHANNEL_IDS.length;
    } else {
      currentIndexRef.current = (currentIndexRef.current - 1 + CHANNEL_IDS.length) % CHANNEL_IDS.length;
    }

    if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      playerRef.current.loadVideoById({
        videoId: CHANNEL_IDS[currentIndexRef.current],
        startSeconds: 0,
      });
      // Maintain unmuted state if already unlocked
      if (audioUnlockedRef.current) {
        playerRef.current.unMute();
      }
    }
  };

  const changeVolume = (delta: number) => {
    if (!playerRef.current || typeof playerRef.current.getVolume !== 'function') return;
    const currentVolume = playerRef.current.getVolume();
    const newVolume = Math.max(0, Math.min(100, currentVolume + delta));
    playerRef.current.setVolume(newVolume);
    
    // Automatically unmute if volume is increased
    if (newVolume > 0 && playerRef.current.isMuted()) {
      playerRef.current.unMute();
    }
  };

  const unlockAudio = () => {
    if (audioUnlockedRef.current || !playerRef.current) return;
    try {
      playerRef.current.unMute();
      playerRef.current.setVolume(100);
      playerRef.current.playVideo();
      audioUnlockedRef.current = true;
    } catch (e) {
      // Browser safety fallback
    }
  };

  useEffect(() => {
    // 1. Load the YouTube IFrame Player API
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const onPlayerError = (event: any) => {
      // Auto-skip to next channel if error occurs (e.g. restriction)
      console.warn('YouTube Error detected:', event.data);
      setTimeout(() => {
        switchChannel('next');
      }, 1000);
    };

    const createPlayer = () => {
      if (playerRef.current) return;

      playerRef.current = new (window as any).YT.Player('yt-player', {
        height: '100%',
        width: '100%',
        videoId: CHANNEL_IDS[currentIndexRef.current],
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          autohide: 1,
          mute: 1, // Start muted for reliable autoplay
        },
        events: {
          onReady: (event: any) => {
            event.target.playVideo();
          },
          onStateChange: (event: any) => {
            if (event.data === (window as any).YT.PlayerState.ENDED) {
              event.target.playVideo();
            }
          },
          onError: onPlayerError
        },
      });
    };

    (window as any).onYouTubeIframeAPIReady = createPlayer;

    if ((window as any).YT && (window as any).YT.Player) {
      createPlayer();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      unlockAudio();
      switch (e.key) {
        case 'ArrowRight':
          switchChannel('next');
          break;
        case 'ArrowLeft':
          switchChannel('prev');
          break;
        case 'ArrowUp':
          changeVolume(10);
          break;
        case 'ArrowDown':
          changeVolume(-10);
          break;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      // Prevent actual page scrolling
      e.preventDefault();
      if (volumeDebounceTimer.current) return;
      
      // Scroll Up = Increase Volume, Scroll Down = Decrease Volume
      const delta = e.deltaY < 0 ? 10 : -10;
      changeVolume(delta);

      // Debounce to prevent rapid volume flickering
      volumeDebounceTimer.current = setTimeout(() => {
        volumeDebounceTimer.current = null;
      }, 250);
    };

    const handleClick = (e: MouseEvent) => {
      // Left click only (button 0)
      if (e.button === 0) {
        unlockAudio();
        switchChannel('next');
      }
    };

    // Global Event Listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('mousedown', handleClick);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('mousedown', handleClick);
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="video-container bg-black fixed inset-0 w-screen h-screen overflow-hidden cursor-none">
      <div id="yt-player" className="w-full h-full pointer-events-none border-none scale-105" />
      {/* Interaction layer to capture initial touch/click for audio unlock */}
      <div className="absolute inset-0 z-10" />
    </div>
  );
}
