import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import EffectsPanel from "./effects/EffectsPanel";
import { Track, Effect } from "@shared/schema";

interface RightPanelProps {
  activeTrack: Track | undefined;
  effects: Effect[];
}

const RightPanel = ({ activeTrack, effects = [] }: RightPanelProps) => {
  // Get audio properties
  const audioProperties = {
    format: "WAV / 24-bit",
    sampleRate: "48000 Hz",
    channels: "Stereo",
    duration: "00:03:46"
  };
  
  return (
    <div className="w-[320px] bg-background border-l border-border flex flex-col overflow-hidden flex-shrink-0">
      <div className="flex items-center justify-between border-b border-border p-3">
        <h3 className="font-medium">Effects & Properties</h3>
        <Button variant="ghost" size="icon" className="w-6 h-6 rounded">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3">
        {activeTrack ? (
          <>
            {/* Effects Panel */}
            <EffectsPanel 
              trackName={activeTrack.name}
              effects={effects}
            />
            
            {/* Audio Properties */}
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-2">Audio Properties</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs mb-1">Format</div>
                  <div className="text-sm bg-background p-1.5 rounded border border-border">
                    {audioProperties.format}
                  </div>
                </div>
                <div>
                  <div className="text-xs mb-1">Sample Rate</div>
                  <div className="text-sm bg-background p-1.5 rounded border border-border">
                    {audioProperties.sampleRate}
                  </div>
                </div>
                <div>
                  <div className="text-xs mb-1">Channels</div>
                  <div className="text-sm bg-background p-1.5 rounded border border-border">
                    {audioProperties.channels}
                  </div>
                </div>
                <div>
                  <div className="text-xs mb-1">Duration</div>
                  <div className="text-sm bg-background p-1.5 rounded border border-border">
                    {audioProperties.duration}
                  </div>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="text-xs mb-1">Notes</div>
                <textarea 
                  className="w-full bg-background border border-border rounded p-2 text-sm resize-none h-20"
                  placeholder="Add notes about this track..."
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Select a track to view and edit effects
          </div>
        )}
      </div>
    </div>
  );
};

export default RightPanel;
