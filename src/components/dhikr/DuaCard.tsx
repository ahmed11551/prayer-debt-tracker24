import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DuaSettingsPanel } from "./DuaSettingsPanel";
import { DuaTextDisplay } from "./DuaTextDisplay";
import { DuaAudioPlayer } from "./DuaAudioPlayer";
import { DuaActions } from "./DuaActions";

interface DuaCardProps {
  dua: {
    id: string;
    arabic: string;
    transcription: string;
    russianTranscription?: string;
    translation: string;
    reference: string;
    audioUrl: string | null;
  };
  categoryColor: string;
}

export const DuaCard = memo(({ dua, categoryColor }: DuaCardProps) => {
  return (
    <Card className="glass shadow-medium border-border/50 hover:shadow-strong transition-all duration-500 group overflow-visible rounded-2xl">
      {/* Decorative top border with gradient */}
      <div className="h-1 bg-gradient-to-r from-primary via-primary/80 to-transparent rounded-t-2xl" />
      
      <CardContent className="p-6 sm:p-8 space-y-6 sm:space-y-8">
        {/* Настройки отображения */}
        <div className="flex items-center justify-end gap-2 pb-2">
          <DuaSettingsPanel />
        </div>

        {/* Text Display */}
        <DuaTextDisplay
          arabic={dua.arabic}
          transcription={dua.transcription}
          russianTranscription={dua.russianTranscription}
          translation={dua.translation}
          reference={dua.reference}
        />

        {/* Audio Player */}
        <DuaAudioPlayer
          duaId={dua.id}
          arabicText={dua.arabic}
          audioUrl={dua.audioUrl}
        />

        {/* Action Buttons */}
        <DuaActions
          duaId={dua.id}
          arabic={dua.arabic}
          transcription={dua.transcription}
          russianTranscription={dua.russianTranscription}
          translation={dua.translation}
          reference={dua.reference}
        />
      </CardContent>
    </Card>
  );
});

DuaCard.displayName = "DuaCard";
