import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { getAudioContext, resumeAudioContext, suspendAudioContext } from '@/lib/audio-context';
import { TrackData, AudioClipData } from '@/lib/track-types';

export interface AudioEngineTrack {
  id: number;
  gainNode: Tone.Volume;
  pannerNode: Tone.Panner;
  analyserNode: Tone.Analyser;
  players: Map<number, Tone.Player>;
  isMuted: boolean;
  isSolo: boolean;
  volume: number;
}

export function useAudioEngine() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const tracksRef = useRef<Map<number, AudioEngineTrack>>(new Map());
  const timeoutIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Initialize Tone.js
    const init = async () => {
      await Tone.start();
      Tone.Transport.bpm.value = 120;
      Tone.Transport.timeSignature = 4;
      
      // Connect to master output
      Tone.Destination.volume.value = 0; // 0dB
      
      setIsInitialized(true);
    };

    if (!isInitialized) {
      init();
    }

    return () => {
      // Cleanup on unmount
      if (timeoutIdRef.current) {
        window.clearInterval(timeoutIdRef.current);
      }
      Tone.Transport.stop();
      Tone.Transport.cancel();
    };
  }, [isInitialized]);

  // Create or update track
  const createTrack = (trackData: TrackData): AudioEngineTrack => {
    const existingTrack = tracksRef.current.get(trackData.id);
    
    if (existingTrack) {
      // Update existing track properties
      existingTrack.volume = trackData.volume;
      existingTrack.isMuted = trackData.muted;
      existingTrack.isSolo = trackData.solo;
      existingTrack.gainNode.volume.value = trackData.muted ? -Infinity : Tone.gainToDb(trackData.volume / 100);
      return existingTrack;
    }
    
    // Create new track components
    const gainNode = new Tone.Volume(Tone.gainToDb(trackData.volume / 100)).toDestination();
    const pannerNode = new Tone.Panner(0).connect(gainNode);
    const analyserNode = new Tone.Analyser('waveform', 1024);
    pannerNode.connect(analyserNode);
    
    // Create track object
    const track: AudioEngineTrack = {
      id: trackData.id,
      gainNode,
      pannerNode,
      analyserNode,
      players: new Map(),
      isMuted: trackData.muted,
      isSolo: trackData.solo,
      volume: trackData.volume
    };
    
    // Store in map
    tracksRef.current.set(trackData.id, track);
    return track;
  };

  // Load and add audio clip to track
  const addAudioClip = async (trackId: number, clipData: AudioClipData): Promise<number> => {
    const track = tracksRef.current.get(trackId);
    if (!track) {
      throw new Error(`Track ${trackId} not found`);
    }
    
    try {
      // Create a new player for this clip
      const player = new Tone.Player({
        url: clipData.path,
        loop: false,
        onload: () => {
          console.log(`Loaded clip ${clipData.name}`);
        }
      }).connect(track.pannerNode);
      
      // Store in track's players map
      track.players.set(clipData.id, player);
      
      return clipData.id;
    } catch (error) {
      console.error(`Failed to load audio clip ${clipData.name}:`, error);
      throw error;
    }
  };

  // Remove audio clip from track
  const removeAudioClip = (trackId: number, clipId: number): boolean => {
    const track = tracksRef.current.get(trackId);
    if (!track) return false;
    
    const player = track.players.get(clipId);
    if (player) {
      player.stop();
      player.dispose();
      return track.players.delete(clipId);
    }
    return false;
  };

  // Update track volume
  const setTrackVolume = (trackId: number, volume: number): void => {
    const track = tracksRef.current.get(trackId);
    if (!track) return;
    
    track.volume = volume;
    track.gainNode.volume.value = track.isMuted ? -Infinity : Tone.gainToDb(volume / 100);
  };

  // Mute/unmute track
  const setTrackMuted = (trackId: number, muted: boolean): void => {
    const track = tracksRef.current.get(trackId);
    if (!track) return;
    
    track.isMuted = muted;
    track.gainNode.volume.value = muted ? -Infinity : Tone.gainToDb(track.volume / 100);
  };

  // Solo/unsolo track
  const setTrackSolo = (trackId: number, solo: boolean): void => {
    const track = tracksRef.current.get(trackId);
    if (!track) return;
    
    track.isSolo = solo;
    
    // Implement solo logic (mute all other tracks)
    let anySolo = false;
    tracksRef.current.forEach(t => {
      if (t.isSolo) anySolo = true;
    });
    
    if (anySolo) {
      tracksRef.current.forEach(t => {
        if (!t.isSolo && !t.isMuted) {
          t.gainNode.volume.value = -Infinity; // Mute non-solo tracks
        }
      });
    } else {
      // No tracks are soloed, restore all non-muted tracks
      tracksRef.current.forEach(t => {
        if (!t.isMuted) {
          t.gainNode.volume.value = Tone.gainToDb(t.volume / 100);
        }
      });
    }
  };

  // Play functionality
  const play = async () => {
    if (!isInitialized) return;
    
    // Make sure audio context is running
    await resumeAudioContext();
    
    // Schedule all audio clips
    for (const track of tracksRef.current.values()) {
      for (const [clipId, player] of track.players.entries()) {
        // Configure playback timing
        player.start();
      }
    }
    
    // Start transport
    Tone.Transport.start();
    setIsPlaying(true);
    
    // Start time tracking
    if (timeoutIdRef.current) {
      window.clearInterval(timeoutIdRef.current);
    }
    timeoutIdRef.current = window.setInterval(() => {
      setCurrentTime(Tone.Transport.seconds);
    }, 50);
  };

  // Pause functionality
  const pause = () => {
    if (!isInitialized) return;
    
    Tone.Transport.pause();
    setIsPlaying(false);
    
    if (timeoutIdRef.current) {
      window.clearInterval(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  };

  // Stop functionality
  const stop = () => {
    if (!isInitialized) return;
    
    Tone.Transport.stop();
    setIsPlaying(false);
    setCurrentTime(0);
    
    if (timeoutIdRef.current) {
      window.clearInterval(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  };

  // Get all tracks
  const getAllTracks = (): AudioEngineTrack[] => {
    return Array.from(tracksRef.current.values());
  };

  // Get specific track
  const getTrack = (trackId: number): AudioEngineTrack | undefined => {
    return tracksRef.current.get(trackId);
  };

  return {
    isInitialized,
    isPlaying,
    currentTime,
    createTrack,
    addAudioClip,
    removeAudioClip,
    setTrackVolume,
    setTrackMuted,
    setTrackSolo,
    play,
    pause,
    stop,
    getAllTracks,
    getTrack
  };
}
