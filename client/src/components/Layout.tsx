import { ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ToolPanel from "./ToolPanel";
import Transport from "./Transport";
import TrackControls from "./TrackControls";
import Timeline from "./Timeline";
import RightPanel from "./RightPanel";
import { Track, AudioClip, Effect } from "@shared/schema";

interface LayoutProps {
  tracks: Track[];
  audioClips: AudioClip[];
  effects: Effect[];
  activeTrackId: number | null;
  onTrackSelect: (trackId: number) => void;
  playbackStatus: "stopped" | "playing" | "paused";
  currentTime: string;
  totalDuration: string;
  playheadPosition: number;
  onPlayPause: () => void;
  onStop: () => void;
}

const Layout = ({
  tracks,
  audioClips,
  effects,
  activeTrackId,
  onTrackSelect,
  playbackStatus,
  currentTime,
  totalDuration,
  playheadPosition,
  onPlayPause,
  onStop
}: LayoutProps) => {
  // Filter audio clips for the current project
  const getClipsForTrack = (trackId: number) => {
    return audioClips.filter(clip => clip.trackId === trackId);
  };
  
  // Get active track
  const activeTrack = tracks.find(track => track.id === activeTrackId);
  
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background text-foreground">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <ToolPanel />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <Transport 
              playbackStatus={playbackStatus}
              currentTime={currentTime}
              totalDuration={totalDuration}
              onPlayPause={onPlayPause}
              onStop={onStop}
            />
            
            <div className="flex-1 flex overflow-hidden">
              <TrackControls 
                tracks={tracks}
                activeTrackId={activeTrackId}
                onTrackSelect={onTrackSelect}
              />
              
              <Timeline 
                tracks={tracks}
                audioClips={audioClips}
                playheadPosition={playheadPosition}
                getClipsForTrack={getClipsForTrack}
              />
            </div>
          </div>
        </div>
        
        <RightPanel 
          activeTrack={activeTrack}
          effects={effects}
        />
      </div>
    </div>
  );
};

export default Layout;
