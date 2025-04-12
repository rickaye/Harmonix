import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Music2Icon, Settings } from "lucide-react";

const Header = () => {
  const [bpm, setBpm] = useState(120);
  const [timeSignature, setTimeSignature] = useState("4/4");
  
  return (
    <header className="bg-card border-b border-border px-4 py-2 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <Music2Icon className="text-primary text-2xl mr-2 h-6 w-6" />
          <h1 className="text-xl font-bold tracking-tight">HarmoniX AI Studio</h1>
        </div>
        
        <div className="flex space-x-1">
          <Button variant="ghost" className="px-3 py-1 text-sm rounded h-8">File</Button>
          <Button variant="ghost" className="px-3 py-1 text-sm rounded h-8">Edit</Button>
          <Button variant="ghost" className="px-3 py-1 text-sm rounded h-8">View</Button>
          <Button variant="ghost" className="px-3 py-1 text-sm rounded h-8">Help</Button>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="flex items-center bg-background rounded-md px-2 py-1">
          <span className="text-sm font-mono mr-1">{bpm}</span>
          <span className="text-xs text-muted-foreground">BPM</span>
        </div>
        <div className="flex items-center bg-background rounded-md px-2 py-1">
          <span className="text-sm font-mono mr-1">{timeSignature}</span>
          <span className="text-xs text-muted-foreground">Time</span>
        </div>
        <Button variant="ghost" size="icon" className="p-1 rounded">
          <Settings className="h-5 w-5" />
        </Button>
        <Avatar className="w-8 h-8 bg-primary">
          <AvatarFallback>JS</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default Header;
