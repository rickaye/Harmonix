import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReverbSettings } from "@/lib/track-types";

interface ReverbProps {
  settings: ReverbSettings;
}

const Reverb = ({ settings }: ReverbProps) => {
  const [reverbSettings, setReverbSettings] = useState<ReverbSettings>(settings || {
    roomSize: 72,
    dampening: 40,
    width: 85,
    wetDry: 30,
    preset: "Medium Hall"
  });
  
  // Handle settings changes
  const updateSetting = (key: keyof ReverbSettings, value: number | string) => {
    setReverbSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Handle preset selection
  const handlePresetChange = (preset: string) => {
    const presetSettings: Record<string, ReverbSettings> = {
      "Small Room": {
        roomSize: 40,
        dampening: 60,
        width: 70,
        wetDry: 20,
        preset: "Small Room"
      },
      "Medium Hall": {
        roomSize: 72,
        dampening: 40,
        width: 85,
        wetDry: 30,
        preset: "Medium Hall"
      },
      "Large Hall": {
        roomSize: 90,
        dampening: 30,
        width: 90,
        wetDry: 40,
        preset: "Large Hall"
      },
      "Cathedral": {
        roomSize: 95,
        dampening: 20,
        width: 95,
        wetDry: 50,
        preset: "Cathedral"
      },
      "Plate": {
        roomSize: 80,
        dampening: 10,
        width: 60,
        wetDry: 35,
        preset: "Plate"
      }
    };
    
    setReverbSettings(presetSettings[preset] || reverbSettings);
  };
  
  return (
    <div className="p-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs mb-1 flex justify-between">
            <span>Room Size</span>
            <span>{reverbSettings.roomSize}%</span>
          </div>
          <Slider
            value={[reverbSettings.roomSize]}
            min={0}
            max={100}
            step={1}
            className="w-full"
            onValueChange={([value]) => updateSetting("roomSize", value)}
          />
        </div>
        
        <div>
          <div className="text-xs mb-1 flex justify-between">
            <span>Dampening</span>
            <span>{reverbSettings.dampening}%</span>
          </div>
          <Slider
            value={[reverbSettings.dampening]}
            min={0}
            max={100}
            step={1}
            className="w-full"
            onValueChange={([value]) => updateSetting("dampening", value)}
          />
        </div>
        
        <div>
          <div className="text-xs mb-1 flex justify-between">
            <span>Width</span>
            <span>{reverbSettings.width}%</span>
          </div>
          <Slider
            value={[reverbSettings.width]}
            min={0}
            max={100}
            step={1}
            className="w-full"
            onValueChange={([value]) => updateSetting("width", value)}
          />
        </div>
        
        <div>
          <div className="text-xs mb-1 flex justify-between">
            <span>Wet/Dry</span>
            <span>{reverbSettings.wetDry}%</span>
          </div>
          <Slider
            value={[reverbSettings.wetDry]}
            min={0}
            max={100}
            step={1}
            className="w-full"
            onValueChange={([value]) => updateSetting("wetDry", value)}
          />
        </div>
      </div>
      
      <div className="mt-2">
        <div className="text-xs mb-1">Preset</div>
        <Select 
          value={reverbSettings.preset} 
          onValueChange={handlePresetChange}
        >
          <SelectTrigger className="w-full bg-background border border-border rounded">
            <SelectValue placeholder="Select preset" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Small Room">Small Room</SelectItem>
            <SelectItem value="Medium Hall">Medium Hall</SelectItem>
            <SelectItem value="Large Hall">Large Hall</SelectItem>
            <SelectItem value="Cathedral">Cathedral</SelectItem>
            <SelectItem value="Plate">Plate</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="mt-2 p-2 bg-background/30 rounded text-xs text-muted-foreground">
        Tip: Use higher room size for more spacious reverb, and lower dampening for brighter sound.
      </div>
    </div>
  );
};

export default Reverb;
