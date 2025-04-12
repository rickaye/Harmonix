import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  SkipBack, 
  Play, 
  Pause,
  SkipForward, 
  Disc, 
  Repeat, 
  Repeat1,
  Fullscreen 
} from "lucide-react";
import LevelMeter from "./LevelMeter";

interface TransportProps {
  playbackStatus: "stopped" | "playing" | "paused";
  currentTime: string;
  totalDuration: string;
  onPlayPause: () => void;
  onStop: () => void;
}

const Transport = ({
  playbackStatus,
  currentTime,
  totalDuration,
  onPlayPause,
  onStop
}: TransportProps) => {
  // Simulate meter levels for visual feedback
  const meterLevels = {
    left: 72,
    right: 68
  };
  
  return (
    <div className="h-12 bg-background flex items-center px-4 border-b border-border">
      <div className="flex items-center space-x-3 mr-8">
        <Button 
          variant="secondary" 
          size="icon" 
          className="w-8 h-8 rounded-full"
          onClick={onStop}
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="default" 
          size="icon" 
          className="w-10 h-10 rounded-full bg-primary hover:bg-primary/90"
          onClick={onPlayPause}
        >
          {playbackStatus === "playing" ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </Button>
        
        <Button 
          variant="secondary" 
          size="icon" 
          className="w-8 h-8 rounded-full"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-8 h-8 rounded-md"
          >
            <Disc className="h-4 w-4 text-destructive" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-8 h-8 rounded-md"
          >
            <Repeat className="h-4 w-4 text-muted-foreground" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-8 h-8 rounded-md"
          >
            <Repeat1 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2 font-mono">
          <span className="text-sm">{currentTime}</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-xs text-muted-foreground">{totalDuration}</span>
        </div>
      </div>
      
      <div className="ml-auto flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">Master</span>
          
          <div className="h-8 w-20 flex items-center">
            <LevelMeter level={meterLevels.left} />
            <LevelMeter level={meterLevels.right} />
          </div>
          
          <div className="w-24">
            <Slider 
              defaultValue={[80]} 
              max={100} 
              step={1}
              className="w-full"
            />
          </div>
          
          <span className="text-xs">0.0 dB</span>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="w-8 h-8 rounded-md"
        >
          <Fullscreen className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default Transport;
