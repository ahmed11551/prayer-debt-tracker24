import { useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { BookmarkPlus, BookmarkCheck, Share2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDuaBookmarks } from "@/hooks/useDuaBookmarks";

interface DuaActionsProps {
  duaId: string;
  arabic: string;
  transcription: string;
  russianTranscription?: string;
  translation: string;
  reference: string;
}

export const DuaActions = memo(({
  duaId,
  arabic,
  transcription,
  russianTranscription,
  translation,
  reference,
}: DuaActionsProps) => {
  const { toast } = useToast();
  const { isBookmarked, toggleBookmark } = useDuaBookmarks(duaId);
  const [isCopied, setIsCopied] = useState(false);

  // Copy handler
  const handleCopy = useCallback(async () => {
    const russianTranscriptionText = russianTranscription ? `\n${russianTranscription}\n` : '';
    const textToCopy = `${arabic}\n\n${transcription}${russianTranscriptionText}\n${translation}\n\n${reference}`;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast({
        title: "Скопировано",
        description: "Дуа скопировано в буфер обмена",
      });
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось скопировать текст",
        variant: "destructive",
      });
    }
  }, [arabic, transcription, russianTranscription, translation, reference, toast]);

  // Share handler
  const handleShare = useCallback(async () => {
    const shareText = `${arabic}\n\n${transcription}${russianTranscription ? `\n${russianTranscription}` : ''}\n\n${translation}\n\n${reference}`;
    const shareData = {
      title: "Дуа",
      text: shareText,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: "Поделились",
          description: "Дуа успешно отправлено",
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Скопировано",
          description: "Дуа скопировано в буфер обмена для отправки",
        });
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        try {
          await navigator.clipboard.writeText(shareText);
          toast({
            title: "Скопировано",
            description: "Дуа скопировано в буфер обмена",
          });
        } catch (clipboardError) {
          console.error("Failed to copy:", clipboardError);
          toast({
            title: "Ошибка",
            description: "Не удалось поделиться или скопировать",
            variant: "destructive",
          });
        }
      }
    }
  }, [arabic, transcription, russianTranscription, translation, reference, toast]);

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
      {/* Bookmark Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleBookmark}
        className="h-9 px-3 hover:bg-primary/10"
      >
        {isBookmarked ? (
          <>
            <BookmarkCheck className="w-4 h-4 mr-2 text-primary" />
            <span className="text-xs sm:text-sm">В избранном</span>
          </>
        ) : (
          <>
            <BookmarkPlus className="w-4 h-4 mr-2" />
            <span className="text-xs sm:text-sm">В избранное</span>
          </>
        )}
      </Button>

      {/* Copy Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="h-9 px-3 hover:bg-primary/10"
      >
        {isCopied ? (
          <>
            <Check className="w-4 h-4 mr-2 text-green-500" />
            <span className="text-xs sm:text-sm">Скопировано</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-2" />
            <span className="text-xs sm:text-sm">Копировать</span>
          </>
        )}
      </Button>

      {/* Share Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        className="h-9 px-3 hover:bg-primary/10"
      >
        <Share2 className="w-4 h-4 mr-2" />
        <span className="text-xs sm:text-sm">Поделиться</span>
      </Button>
    </div>
  );
});

DuaActions.displayName = "DuaActions";

