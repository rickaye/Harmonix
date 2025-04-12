import { useRef, useEffect, useState } from "react";
import AudioClip from "./AudioClip";
import { Track, AudioClip as AudioClipType } from "@shared/schema";

interface TimelineProps {
  tracks: Track[];
  audioClips: AudioClipType[];
  playheadPosition: number;
  getClipsForTrack: (trackId: number) => AudioClipType[];
}

const Timeline = ({ 
  tracks, 
  audioClips,
  playheadPosition,
  getClipsForTrack
}: TimelineProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [timeMarkers, setTimeMarkers] = useState<{ time: string; position: number }[]>([]);
  const [containerWidth, setContainerWidth] = useState(1600);
  
  // Pixel to time conversion factor (ms per pixel)
  const pixelToTimeRatio = 20; // 20ms per pixel
  
  // Generate time markers for the ruler
  useEffect(() => {
    const markers = [];
    const interval = 5; // 5 second intervals
    const intervalPixels = interval * 1000 / pixelToTimeRatio;
    
    for (let i = 0; i <= containerWidth / intervalPixels; i++) {
      const position = i * intervalPixels;
      const timeInSeconds = (position * pixelToTimeRatio) / 1000;
      const minutes = Math.floor(timeInSeconds / 60);
      const seconds = Math.floor(timeInSeconds % 60);
      const time = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      markers.push({ time, position });
    }
    
    setTimeMarkers(markers);
  }, [containerWidth]);
  
  // Update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    
    return () => window.removeEventListener('resize', updateWidth);
  }, []);
  
  return (
    <div className="flex-1 relative overflow-x-auto overflow-y-auto bg-background" ref={containerRef}>
      {/* Time Ruler */}
      <div className="sticky top-0 z-10 h-8 bg-card border-b border-border flex items-end px-2 overflow-hidden">
        <div className="absolute left-0 right-0 bottom-0 h-6">
          {timeMarkers.map((marker, index) => (
            <div 
              key={index} 
              className="time-marker" 
              style={{ left: `${marker.position}px` }}
            >
              {marker.time}
            </div>
          ))}
        </div>
        
        {/* Playhead */}
        <div 
          className="absolute h-full w-0.5 bg-accent z-20 pointer-events-none" 
          style={{ left: `${playheadPosition}px`, top: 0 }}
        >
          <div className="w-3 h-3 bg-accent -ml-1.5 -mt-1 rounded-full"></div>
        </div>
      </div>
      
      {/* Track Lanes */}
      <div className="relative" style={{ minWidth: `${containerWidth}px` }}>
        {tracks.map(track => {
          const trackClips = getClipsForTrack(track.id);
          
          return (
            <div 
              key={track.id} 
              className="h-20 border-b border-border relative"
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <span className="text-sm text-foreground">{track.name}</span>
              </div>
              
              {/* Audio Clips */}
              {trackClips.map(clip => (
                <AudioClip 
                  key={clip.id}
                  clip={clip}
                  trackColor={track.color}
                  pixelToTimeRatio={pixelToTimeRatio}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;
