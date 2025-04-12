import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Baseline, CircleCheck, ChevronDown, ChevronUp } from "lucide-react";
import Equalizer from "./Equalizer";
import Reverb from "./Reverb";
import Compressor from "./Compressor";
import { Effect } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface EffectsPanelProps {
  trackName: string;
  effects: Effect[];
}

// Map effect types to component names for display
const effectTypeLabels: Record<string, string> = {
  eq: "Equalizer",
  reverb: "Reverb",
  compressor: "Compressor",
  delay: "Delay",
  distortion: "Distortion",
  chorus: "Chorus",
  flanger: "Flanger",
  phaser: "Phaser",
  tremolo: "Tremolo",
  limiter: "Limiter"
};

// Map effect types to icons
const effectTypeIcons: Record<string, React.ReactNode> = {
  eq: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6"></line>
      <line x1="4" y1="12" x2="20" y2="12"></line>
      <line x1="4" y1="18" x2="20" y2="18"></line>
    </svg>
  ),
  reverb: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12h2a10 10 0 0 1 10 10v-2a8 8 0 0 0-8-8H2z"></path>
      <path d="M2 6h2a14 14 0 0 1 14 14v-2a12 12 0 0 0-12-12H2z"></path>
      <circle cx="4" cy="12" r="2"></circle>
    </svg>
  ),
  compressor: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2"></rect>
      <path d="M17 6v12"></path>
      <path d="M7 6v12"></path>
    </svg>
  )
};

const EffectsPanel = ({ trackName, effects }: EffectsPanelProps) => {
  const { toast } = useToast();
  // Track which effects are expanded
  const [expandedEffects, setExpandedEffects] = useState<Record<number, boolean>>({});
  
  // Add new effect
  const handleAddEffect = () => {
    toast({
      title: "Add Effect",
      description: "Choose an effect from the menu to add to this track.",
    });
  };
  
  // Toggle expand/collapse effect
  const toggleExpand = (effectId: number) => {
    setExpandedEffects(prev => ({
      ...prev,
      [effectId]: !prev[effectId]
    }));
  };
  
  // Toggle effect enabled state
  const toggleEffectEnabled = (effectId: number, enabled: boolean) => {
    toast({
      title: enabled ? "Effect Enabled" : "Effect Disabled",
      description: `The effect has been ${enabled ? 'enabled' : 'disabled'}.`
    });
  };
  
  // Render specific effect component based on type
  const renderEffect = (effect: Effect) => {
    const isExpanded = expandedEffects[effect.id] !== false; // Default to expanded
    
    switch (effect.type) {
      case 'eq':
        return isExpanded ? <Equalizer settings={effect.settings} /> : null;
      case 'reverb':
        return isExpanded ? <Reverb settings={effect.settings} /> : null;
      case 'compressor':
        return isExpanded ? <Compressor settings={effect.settings} /> : null;
      default:
        return isExpanded ? (
          <div className="p-3 text-sm text-muted-foreground">
            Effect settings for {effect.name}
          </div>
        ) : null;
    }
  };
  
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-muted-foreground">
          Selected Track: <span className="text-foreground">{trackName}</span>
        </h4>
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={handleAddEffect}
        >
          <Plus className="h-3 w-3 mr-1" />Add Effect
        </Button>
      </div>
      
      {effects.length > 0 ? (
        effects.map(effect => (
          <div 
            key={effect.id} 
            className="bg-card rounded-md mb-2 overflow-hidden"
          >
            <div className="p-2 bg-background flex items-center justify-between">
              <div className="flex items-center">
                {effectTypeIcons[effect.type] || (
                  <svg className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M9 12h6" />
                  </svg>
                )}
                <span className="text-sm ml-1.5">{effect.name}</span>
              </div>
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="w-6 h-6 rounded"
                  onClick={() => toggleEffectEnabled(effect.id, !effect.enabled)}
                >
                  {effect.enabled ? (
                    <CircleCheck className="h-4 w-4 text-primary" />
                  ) : (
                    <Baseline className="h-4 w-4" />
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="w-6 h-6 rounded"
                  onClick={() => toggleExpand(effect.id)}
                >
                  {expandedEffects[effect.id] === false ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronUp className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            {renderEffect(effect)}
          </div>
        ))
      ) : (
        <div className="bg-card/30 rounded-md p-4 text-center text-sm text-muted-foreground">
          No effects added to this track yet.
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-full"
            onClick={handleAddEffect}
          >
            <Plus className="h-3 w-3 mr-1" />Add your first effect
          </Button>
        </div>
      )}
    </div>
  );
};

export default EffectsPanel;
