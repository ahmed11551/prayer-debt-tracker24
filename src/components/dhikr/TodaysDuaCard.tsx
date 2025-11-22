import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Share2 } from "lucide-react";
import { useDuaBookmarks } from "@/hooks/useDuaBookmarks";
import { useToast } from "@/hooks/use-toast";

interface DuaItem {
  id: string;
  arabic: string;
  transcription: string;
  russianTranscription?: string;
  translation: string;
  reference: string;
  audioUrl: string | null;
  title?: string;
}

interface TodaysDuaCardProps {
  dua: DuaItem;
  onShare?: () => void;
}

// Иконка молящихся рук
const PrayingHands = () => (
  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
    <span className="text-green-500 text-xl">🤲</span>
  </div>
);

export const TodaysDuaCard = memo(({ dua, onShare }: TodaysDuaCardProps) => {
  const { isBookmarked, toggleBookmark } = useDuaBookmarks(dua.id);
  const { toast } = useToast();

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      const shareText = `${dua.arabic}\n\n${dua.transcription}${dua.russianTranscription ? `\n${dua.russianTranscription}` : ''}\n\n${dua.translation}\n\n${dua.reference}`;
      const shareData = {
        title: "Сегодняшний Dua",
        text: shareText,
      };

      if (navigator.share) {
        navigator.share(shareData).catch(() => {
          toast({
            title: "Ошибка",
            description: "Не удалось поделиться",
            variant: "destructive",
          });
        });
      } else {
        navigator.clipboard.writeText(shareText).then(() => {
          toast({
            title: "Скопировано",
            description: "Дуа скопировано в буфер обмена",
          });
        });
      }
    }
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <PrayingHands />
          <h3 className="font-semibold text-lg text-gray-900">Сегодняшний Dua</h3>
        </div>
        
        <div className="space-y-3">
          <p className="text-sm text-gray-800 leading-relaxed">
            {dua.arabic}
          </p>
          {dua.transcription && (
            <p className="text-sm text-gray-600 italic">
              {dua.transcription}
            </p>
          )}
          {dua.translation && (
            <p className="text-sm text-gray-500">
              {dua.translation}
            </p>
          )}
        </div>

        <div className="flex items-center gap-6 pt-3 border-t border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleBookmark}
            className={isBookmarked ? "text-yellow-500" : ""}
          >
            <Star className={`w-4 h-4 mr-2 ${isBookmarked ? "fill-yellow-500" : ""}`} />
            <span className="text-sm">{isBookmarked ? "В избранном" : "В избранное"}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            <span className="text-sm">Поделиться</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

TodaysDuaCard.displayName = "TodaysDuaCard";

