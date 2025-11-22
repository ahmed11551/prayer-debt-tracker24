import { memo } from "react";
import { cn } from "@/lib/utils";
import { useDuaSettings } from "@/hooks/useDuaSettings";

interface DuaTextDisplayProps {
  arabic: string;
  transcription: string;
  russianTranscription?: string;
  translation: string;
  reference: string;
}

export const DuaTextDisplay = memo(({
  arabic,
  transcription,
  russianTranscription,
  translation,
  reference,
}: DuaTextDisplayProps) => {
  const { settings, getArabicFontSizeClass } = useDuaSettings();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Arabic Text */}
      <div className="text-center px-2 sm:px-4">
        <p 
          className={cn(
            "leading-relaxed font-arabic text-foreground select-none",
            getArabicFontSizeClass()
          )}
          style={{ 
            fontFamily: "'Amiri', 'Noto Sans Arabic', serif",
            lineHeight: "1.8",
            letterSpacing: "0.02em"
          }}
          dir="rtl"
        >
          {arabic}
        </p>
      </div>

      {/* Transcription (Latin) - Improved styling */}
      {settings.showTranscription && (
        <>
          {(settings.transcriptionType === "latin" || settings.transcriptionType === "both") && (
            <div className="bg-gradient-to-br from-secondary/40 to-secondary/20 rounded-2xl p-5 sm:p-6 border border-border/40 shadow-inner backdrop-blur-sm">
              <p className="text-center text-lg sm:text-xl text-foreground/95 italic leading-relaxed font-medium">
                {transcription}
              </p>
            </div>
          )}

          {/* Russian Transcription - Enhanced design */}
          {russianTranscription && (settings.transcriptionType === "cyrillic" || settings.transcriptionType === "both") && (
            <div className="bg-gradient-to-br from-accent/15 to-accent/5 rounded-2xl p-5 sm:p-6 border border-accent/30 shadow-inner backdrop-blur-sm">
              <p className="text-center text-base sm:text-lg text-foreground/95 leading-relaxed font-medium">
                {russianTranscription}
              </p>
            </div>
          )}
        </>
      )}

      {/* Translation - Professional styling */}
      {settings.showTranslation && (
        <div className="bg-gradient-to-br from-primary/8 to-primary/3 rounded-2xl p-5 sm:p-6 border border-primary/25 shadow-inner backdrop-blur-sm">
          <p className="text-center text-base sm:text-lg text-foreground leading-relaxed font-normal">
            {translation}
          </p>
        </div>
      )}

      {/* Reference - Elegant design */}
      <div className="flex items-center justify-center gap-3 text-sm sm:text-base text-muted-foreground/80">
        <div className="w-1.5 h-1.5 rounded-full bg-accent/60" />
        <span className="font-medium italic">{reference}</span>
        <div className="w-1.5 h-1.5 rounded-full bg-accent/60" />
      </div>
    </div>
  );
});

DuaTextDisplay.displayName = "DuaTextDisplay";

