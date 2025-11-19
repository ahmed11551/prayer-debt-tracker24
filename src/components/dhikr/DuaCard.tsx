import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, BookmarkPlus, Share2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DuaCardProps {
  dua: {
    id: string;
    arabic: string;
    transcription: string;
    translation: string;
    reference: string;
    audioUrl: string | null;
  };
  categoryColor: string;
}

export const DuaCard = ({ dua, categoryColor }: DuaCardProps) => {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    const textToCopy = `${dua.arabic}\n\n${dua.transcription}\n\n${dua.translation}\n\n${dua.reference}`;
    await navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast({
      title: "Скопировано",
      description: "Дуа скопировано в буфер обмена",
    });
  };

  const handleShare = () => {
    toast({
      title: "Поделиться",
      description: "Функция будет доступна в следующей версии",
    });
  };

  const handleBookmark = () => {
    toast({
      title: "Добавлено в избранное",
      description: "Дуа сохранено в ваших закладках",
    });
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    toast({
      title: isPlaying ? "Пауза" : "Воспроизведение",
      description: "Аудио функция будет доступна в следующей версии",
    });
  };

  return (
    <Card className="glass shadow-medium border-border/50 hover:shadow-strong transition-all duration-300 group overflow-hidden">
      <div className="h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
      <CardContent className="pt-6 space-y-6">
        {/* Arabic Text */}
        <div className="text-center">
          <p className="text-3xl leading-loose font-arabic text-foreground" style={{ fontFamily: "'Amiri', serif" }}>
            {dua.arabic}
          </p>
        </div>

        {/* Transcription */}
        <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
          <p className="text-center text-lg text-foreground/90 italic">
            {dua.transcription}
          </p>
        </div>

        {/* Translation */}
        <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
          <p className="text-center text-base text-foreground leading-relaxed">
            {dua.translation}
          </p>
        </div>

        {/* Reference */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <div className="w-1 h-1 rounded-full bg-accent" />
          <span>{dua.reference}</span>
          <div className="w-1 h-1 rounded-full bg-accent" />
        </div>

        {/* Audio Player */}
        <div className="flex items-center gap-2 bg-gradient-secondary rounded-xl p-3 border border-border/30">
          <Button
            size="icon"
            variant="ghost"
            onClick={togglePlay}
            className="shrink-0 hover:bg-primary/10 hover:text-primary"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </Button>
          <div className="flex-1 h-2 bg-border/30 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-primary w-0 transition-all duration-300" />
          </div>
          <Volume2 className="w-5 h-5 text-muted-foreground" />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="hover:bg-primary/10 hover:text-primary transition-colors"
          >
            {isCopied ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            {isCopied ? "Скопировано" : "Копировать"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleBookmark}
            className="hover:bg-accent/10 hover:text-accent transition-colors"
          >
            <BookmarkPlus className="w-4 h-4 mr-2" />
            Сохранить
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleShare}
            className="hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Поделиться
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
