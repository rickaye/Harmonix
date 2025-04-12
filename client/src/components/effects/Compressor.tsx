import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { CompressorSettings } from "@/lib/track-types";

interface CompressorProps {
  settings: CompressorSettings;
}

const Compressor = ({ settings }: CompressorProps) => {
  const [compressorSettings, setCompressorSettings] = useState<CompressorSettings>(settings || {
    threshold: -24,
    ratio: 4,
    attack: 0.003,
    release: 0.25,
    knee: 30,
    makeupGain: 1
  });
  
  // Update a single compressor setting
  const updateSetting = (key: keyof CompressorSettings, value: number) => {
    setCompressorSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Visualization
  const CompressorVisualization = () => {
    const { threshold, ratio, knee } = compressorSettings;
    
    // Calculate visualization points
    const thresholdPosition = Math.abs(threshold) / 60; // 0-60dB range
    const kneeWidth = knee / 40; // 0-40dB knee range
    
    return (
      <div className="h-32 bg-background rounded-md relative mb-3">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          <g stroke="#333" strokeWidth="0.5">
            {[0, 25, 50, 75, 100].map(y => (
              <line key={`h-${y}`} x1="0" y1={y} x2="100" y2={y} />
            ))}
            {[0, 25, 50, 75, 100].map(x => (
              <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="100" />
            ))}
          </g>
          
          {/* 1:1 Reference Line */}
          <line 
            x1="0" 
            y1="100" 
            x2="100" 
            y2="0" 
            stroke="#555" 
            strokeWidth="1" 
            strokeDasharray="2,2" 
          />
          
          {/* Compression curve */}
          <path
            d={`
              M 0 100
              L ${thresholdPosition * 100 - kneeWidth * 50} ${100 - thresholdPosition * 100}
              Q ${thresholdPosition * 100} ${100 - thresholdPosition * 100}
              ${thresholdPosition * 100 + (100 - thresholdPosition * 100) / ratio / 2} ${100 - thresholdPosition * 100 - (100 - thresholdPosition * 100) / 2}
              L 100 0
            `}
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            fill="none"
          />
          
          {/* Threshold marker */}
          <line
            x1={thresholdPosition * 100}
            y1="0"
            x2={thresholdPosition * 100}
            y2="100"
            stroke="hsl(var(--primary))"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
          
          {/* Labels */}
          <text 
            x="5" 
            y="15" 
            fontSize="8" 
            fill="hsl(var(--muted-foreground))"
          >
            Input
          </text>
          <text 
            x="75" 
            y="95" 
            fontSize="8" 
            fill="hsl(var(--muted-foreground))"
          >
            Output
          </text>
          <text 
            x={thresholdPosition * 100 + 2} 
            y="50" 
            fontSize="8" 
            fill="hsl(var(--primary))"
          >
            Threshold
          </text>
        </svg>
      </div>
    );
  };
  
  // Format time values (attack/release)
  const formatTime = (seconds: number) => {
    if (seconds < 0.001) {
      return `${(seconds * 1000000).toFixed(2)} μs`;
    } else if (seconds < 1) {
      return `${(seconds * 1000).toFixed(1)} ms`;
    } else {
      return `${seconds.toFixed(2)} s`;
    }
  };
  
  return (
    <div className="p-3">
      <CompressorVisualization />
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs mb-1 flex justify-between">
            <span>Threshold</span>
            <span>{compressorSettings.threshold} dB</span>
          </div>
          <Slider
            value={[compressorSettings.threshold]}
            min={-60}
            max={0}
            step={1}
            className="w-full"
            onValueChange={([value]) => updateSetting("threshold", value)}
          />
        </div>
        
        <div>
          <div className="text-xs mb-1 flex justify-between">
            <span>Ratio</span>
            <span>{compressorSettings.ratio}:1</span>
          </div>
          <Slider
            value={[compressorSettings.ratio]}
            min={1}
            max={20}
            step={0.5}
            className="w-full"
            onValueChange={([value]) => updateSetting("ratio", value)}
          />
        </div>
        
        <div>
          <div className="text-xs mb-1 flex justify-between">
            <span>Attack</span>
            <span>{formatTime(compressorSettings.attack)}</span>
          </div>
          <Slider
            value={[compressorSettings.attack * 1000]} // Convert to ms for slider
            min={0.1}
            max={100}
            step={0.1}
            className="w-full"
            onValueChange={([value]) => updateSetting("attack", value / 1000)} // Convert back to seconds
          />
        </div>
        
        <div>
          <div className="text-xs mb-1 flex justify-between">
            <span>Release</span>
            <span>{formatTime(compressorSettings.release)}</span>
          </div>
          <Slider
            value={[compressorSettings.release * 1000]} // Convert to ms for slider
            min={1}
            max={1000}
            step={1}
            className="w-full"
            onValueChange={([value]) => updateSetting("release", value / 1000)} // Convert back to seconds
          />
        </div>
        
        <div>
          <div className="text-xs mb-1 flex justify-between">
            <span>Knee</span>
            <span>{compressorSettings.knee} dB</span>
          </div>
          <Slider
            value={[compressorSettings.knee]}
            min={0}
            max={40}
            step={1}
            className="w-full"
            onValueChange={([value]) => updateSetting("knee", value)}
          />
        </div>
        
        <div>
          <div className="text-xs mb-1 flex justify-between">
            <span>Makeup Gain</span>
            <span>{compressorSettings.makeupGain > 0 ? "+" : ""}{compressorSettings.makeupGain} dB</span>
          </div>
          <Slider
            value={[compressorSettings.makeupGain]}
            min={-12}
            max={12}
            step={0.5}
            className="w-full"
            onValueChange={([value]) => updateSetting("makeupGain", value)}
          />
        </div>
      </div>
    </div>
  );
};

export default Compressor;
