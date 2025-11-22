import { memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX, Loader2 } from "lucide-react";
import { useDuaAudio } from "@/hooks/useDuaAudio";
import { cn } from "@/lib/utils";

interface DuaAudioPlayerProps {
  duaId: string;
  arabicText: string;
  audioUrl: string | null;
}

export const DuaAudioPlayer = memo(({
  duaId,
  arabicText,
  audioUrl,
}: DuaAudioPlayerProps) => {
  const {
    isPlaying,
    progress,
    duration,
    volume,
    isMuted,
    isLoadingAudio,
    audioError,
    canPlay,
    togglePlay,
    handleProgressClick,
    handleVolumeChange,
    toggleMute,
  } = useDuaAudio({
    duaId,
    arabicText,
    initialAudioUrl: audioUrl,
  });

  // Memoized formatted duration
  const formattedDuration = useMemo(() => {
    if (duration <= 0) return "0:00";
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [duration]);

  // Memoized current time
  const currentTime = useMemo(() => {
    if (duration <= 0) return "0:00";
    const current = (progress / 100) * duration;
    const minutes = Math.floor(current / 60);
    const seconds = Math.floor(current % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [progress, duration]);

  if (!canPlay && !isLoadingAudio && !audioError) {
    return null; // Don't show player if audio is not available
  }

  return (
    <div className="space-y-4">
      {/* Error Message */}
      {audioError && (
        <div className="text-center">
          <p className="text-xs sm:text-sm text-destructive">{audioError}</p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-2">
        <div
          className="relative h-2 bg-muted rounded-full cursor-pointer group"
          onClick={handleProgressClick}
        >
          <div
            className="absolute h-full bg-primary rounded-full transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="h-4 w-4 bg-primary rounded-full shadow-lg" />
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{currentTime}</span>
          <span>{formattedDuration}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        {/* Play/Pause Button */}
        <Button
          variant="default"
          size="lg"
          onClick={togglePlay}
          disabled={!canPlay || isLoadingAudio}
          className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          {isLoadingAudio ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </Button>

        {/* Volume Control */}
        <div className="flex items-center gap-2 flex-1 max-w-[150px]">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className="h-8 w-8 p-0"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          <Slider
            value={[volume]}
            onValueChange={handleVolumeChange}
            max={1}
            min={0}
            step={0.01}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
});

DuaAudioPlayer.displayName = "DuaAudioPlayer";

