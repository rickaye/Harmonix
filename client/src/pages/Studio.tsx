import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Track, AudioClip, Effect } from "@shared/schema";

const Studio = () => {
  const [activeTrackId, setActiveTrackId] = useState<number | null>(null);
  const [playbackStatus, setPlaybackStatus] = useState<"stopped" | "playing" | "paused">("stopped");
  const [currentTime, setCurrentTime] = useState("00:00:00.000");
  const [totalDuration, setTotalDuration] = useState("00:03:46.000");
  const [playheadPosition, setPlayheadPosition] = useState(284); // in pixels
  
  // Fetch project data
  const { data: tracks, isLoading: tracksLoading } = useQuery({
    queryKey: ['/api/projects/1/tracks'],
    refetchInterval: false
  });

  // Fetch audio clips for all tracks
  const { data: audioClips, isLoading: clipsLoading } = useQuery({
    queryKey: ['/api/tracks/all/clips'],
    enabled: !!tracks,
    refetchInterval: false
  });

  // Fetch effects for the active track
  const { data: effects, isLoading: effectsLoading } = useQuery({
    queryKey: ['/api/tracks', activeTrackId, 'effects'],
    enabled: !!activeTrackId,
    refetchInterval: false
  });
  
  // Set initial active track
  useEffect(() => {
    if (tracks && tracks.length > 0 && !activeTrackId) {
      setActiveTrackId(tracks[0].id);
    }
  }, [tracks, activeTrackId]);
  
  // Timer for playback simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (playbackStatus === "playing") {
      timer = setInterval(() => {
        // Simulate playhead movement
        setPlayheadPosition(prev => (prev + 2) % 1600);
        
        // Update current time display
        const time = new Date(0);
        time.setMilliseconds(playheadPosition * 20); // 20ms per pixel
        const timeString = time.toISOString().substring(11, 23);
        setCurrentTime(timeString);
      }, 100);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [playbackStatus, playheadPosition]);
  
  const handlePlayPause = () => {
    setPlaybackStatus(prev => prev === "playing" ? "paused" : "playing");
  };
  
  const handleStop = () => {
    setPlaybackStatus("stopped");
    setPlayheadPosition(0);
    setCurrentTime("00:00:00.000");
  };
  
  const handleTrackSelect = (trackId: number) => {
    setActiveTrackId(trackId);
  };
  
  return (
    <Layout 
      tracks={tracks as Track[] || []}
      audioClips={audioClips as AudioClip[] || []}
      effects={effects as Effect[] || []}
      activeTrackId={activeTrackId}
      onTrackSelect={handleTrackSelect}
      playbackStatus={playbackStatus}
      currentTime={currentTime}
      totalDuration={totalDuration}
      playheadPosition={playheadPosition}
      onPlayPause={handlePlayPause}
      onStop={handleStop}
    />
  );
};

export default Studio;
