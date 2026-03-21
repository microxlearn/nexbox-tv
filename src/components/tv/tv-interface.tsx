'use client';

import React from 'react';
import { VideoPlayer } from './video-player';

/**
 * Pure TV Experience Interface
 * Renders a full-screen video with zero UI elements.
 */
export function TVInterface() {
  return (
    <div className="h-screen w-screen bg-black overflow-hidden m-0 p-0">
      <VideoPlayer />
    </div>
  );
}
