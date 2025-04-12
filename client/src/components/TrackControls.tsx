import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Volume2, 
  Settings, 
  MicOff,
  Eye,
  Disc,
  Plus 
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import LevelMeter from "./LevelMeter";
import { Track } from "@shared/schema";

interface TrackControlsProps {
  tracks: Track[];
  activeTrackId: number | null;
  onTrackSelect: (trackId: number) => void;
}

const TrackControls = ({ 
  tracks, 
  activeTrackId,
  onTrackSelect
}: TrackControlsProps) => {
  // Track state management functions
  const [trackStates, setTrackStates] = useState<Record<number, {
    muted: boolean;
    solo: boolean;
    visible: boolean;
    recordEnabled: boolean;
    volume: number;
    meterLevels: {
      left: number;
      right: number;
    };
  }>>({});
  
  // Initialize track states if not present
  const getTrackState = (trackId: number) => {
    if (!trackStates[trackId]) {
      setTrackStates(prev => ({
        ...prev,
        [trackId]: {
          muted: false,
          solo: false,
          visible: true,
          recordEnabled: false,
          volume: 75,
          meterLevels: {
            left: Math.floor(Math.random() * 40) + 40, // Random level between 40-80
            right: Math.floor(Math.random() * 40) + 40
          }
        }
      }));
      
      return {
        muted: false,
        solo: false,
        visible: true,
        recordEnabled: false,
        volume: 75,
        meterLevels: {
          left: 60,
          right: 58
        }
      };
    }
    
    return trackStates[trackId];
  };
  
  // Update track volume
  const updateTrackVolume = (trackId: number, volume: number) => {
    setTrackStates(prev => ({
      ...prev,
      [trackId]: {
        ...prev[trackId],
        volume
      }
    }));
  };
  
  // Toggle track property
  const toggleTrackProperty = (trackId: number, property: 'muted' | 'solo' | 'visible' | 'recordEnabled') => {
    setTrackStates(prev => ({
      ...prev,
      [trackId]: {
        ...prev[trackId],
        [property]: !prev[trackId][property]
      }
    }));
  };
  
  // Volume to dB conversion for display
  const volumeToDB = (volume: number) => {
    if (volume <= 0) return "-∞";
    // Simple linear conversion for display purposes
    const db = ((volume / 100) * 60) - 60;
    return db.toFixed(1);
  };
  
  return (
    <div className="w-[240px] bg-background flex-shrink-0 border-r border-border overflow-y-auto">
      {tracks.map(track => {
        const state = getTrackState(track.id);
        const isActive = track.id === activeTrackId;
        
        return (
          <div 
            key={track.id} 
            className={`p-2 border-b border-border ${isActive ? 'bg-card/50' : ''}`}
            onClick={() => onTrackSelect(track.id)}
          >
            <div className="flex items-center mb-1">
              <Button 
                size="sm"
                variant="secondary"
                className={`w-6 h-6 rounded-md flex items-center justify-center mr-2`}
                style={{ backgroundColor: track.color }}
              >
                <Volume2 className="h-3 w-3 text-white" />
              </Button>
              
              <span className="text-sm font-medium truncate">{track.name}</span>
              
              {track.type === 'ai-generated' && (
                <div className="ml-1 px-1 text-xs bg-primary/20 text-primary rounded">AI</div>
              )}
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-auto w-6 h-6 rounded-md"
              >
                <Settings className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between mb-1">
              <div className="h-6 w-10 flex items-center">
                <LevelMeter level={state.meterLevels.left} />
                <LevelMeter level={state.meterLevels.right} />
              </div>
              
              <div className="w-[150px]">
                <Slider 
                  value={[state.volume]} 
                  min={0} 
                  max={100} 
                  step={1}
                  onValueChange={([value]) => updateTrackVolume(track.id, value)}
                />
              </div>
              
              <span className="text-xs font-mono w-10 text-right">
                {volumeToDB(state.volume)}dB
              </span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button 
                variant={state.muted ? "default" : "secondary"}
                size="icon"
                className="w-5 h-5 rounded bg-card"
                onClick={() => toggleTrackProperty(track.id, 'muted')}
              >
                <MicOff className="h-3 w-3" />
              </Button>
              
              <Button
                variant={state.visible ? "secondary" : "default"}
                size="icon"
                className="w-5 h-5 rounded bg-card"
                onClick={() => toggleTrackProperty(track.id, 'visible')}
              >
                <Eye className="h-3 w-3" />
              </Button>
              
              <Button
                variant={state.recordEnabled ? "default" : "secondary"}
                size="icon"
                className={`w-5 h-5 rounded bg-card ${state.recordEnabled ? 'text-destructive' : ''}`}
                onClick={() => toggleTrackProperty(track.id, 'recordEnabled')}
              >
                <Disc className="h-3 w-3" />
              </Button>
              
              <div className="flex-1"></div>
              
              <div 
                className="w-5 h-5 rounded-sm" 
                style={{ backgroundColor: track.color }}
              ></div>
            </div>
          </div>
        );
      })}
      
      {/* Add Track Button */}
      <div className="p-3 flex justify-center">
        <Button 
          variant="outline" 
          className="w-full py-1.5 rounded-md border border-dashed text-sm flex items-center justify-center"
        >
          <Plus className="h-3 w-3 mr-1" /> Add Track
        </Button>
      </div>
    </div>
  );
};

export default TrackControls;
