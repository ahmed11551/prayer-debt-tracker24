import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX, BookmarkPlus, BookmarkCheck, Share2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { eReplikaAPI } from "@/lib/api";

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

export const DuaCard = ({ dua, categoryColor }: DuaCardProps) => {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(dua.audioUrl);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isTTSAvailable, setIsTTSAvailable] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Проверяем, добавлено ли дуа в избранное
  useEffect(() => {
    const bookmarksKey = "prayer_debt_bookmarks";
    const existingBookmarks = localStorage.getItem(bookmarksKey);
    if (existingBookmarks) {
      const bookmarks = JSON.parse(existingBookmarks);
      const isInBookmarks = bookmarks.some((b: any) => b.id === dua.id);
      setIsBookmarked(isInBookmarks);
    }
  }, [dua.id]);

  // Проверяем доступность синтеза речи
  useEffect(() => {
    if ("speechSynthesis" in window) {
      try {
        const synth = window.speechSynthesis;
        // Проверяем, есть ли доступные голоса
        const voices = synth.getVoices();
        setIsTTSAvailable(voices.length > 0);
        synthRef.current = synth;
        
        // Если голоса еще не загружены, ждем события voiceschanged
        if (voices.length === 0) {
          const onVoicesChanged = () => {
            const updatedVoices = synth.getVoices();
            setIsTTSAvailable(updatedVoices.length > 0);
            synth.removeEventListener("voiceschanged", onVoicesChanged);
          };
          synth.addEventListener("voiceschanged", onVoicesChanged);
          return () => {
            synth.removeEventListener("voiceschanged", onVoicesChanged);
          };
        }
      } catch (error) {
        console.warn("Speech synthesis check failed:", error);
        setIsTTSAvailable(false);
      }
    } else {
      setIsTTSAvailable(false);
    }
  }, []);

  const handleCopy = async () => {
    const russianTranscriptionText = dua.russianTranscription ? `\n${dua.russianTranscription}\n` : '';
    const textToCopy = `${dua.arabic}\n\n${dua.transcription}${russianTranscriptionText}\n${dua.translation}\n\n${dua.reference}`;
    await navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast({
      title: "Скопировано",
      description: "Дуа скопировано в буфер обмена",
    });
  };

  const handleShare = async () => {
    const shareText = `${dua.arabic}\n\n${dua.transcription}${dua.russianTranscription ? `\n${dua.russianTranscription}` : ''}\n\n${dua.translation}\n\n${dua.reference}`;
    const shareData = {
      title: "Дуа",
      text: shareText,
    };

    try {
      // Пробуем использовать Web Share API
      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: "Поделились",
          description: "Дуа успешно отправлено",
        });
      } else {
        // Fallback: копируем в буфер обмена
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Скопировано",
          description: "Дуа скопировано в буфер обмена для отправки",
        });
      }
    } catch (error: any) {
      // Пользователь отменил или произошла ошибка
      if (error.name !== "AbortError") {
        // Fallback: копируем в буфер обмена
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Скопировано",
          description: "Дуа скопировано в буфер обмена",
        });
      }
    }
  };

  const handleBookmark = () => {
    try {
      // Получаем сохраненные закладки из localStorage
      const bookmarksKey = "prayer_debt_bookmarks";
      const existingBookmarks = localStorage.getItem(bookmarksKey);
      const bookmarks = existingBookmarks ? JSON.parse(existingBookmarks) : [];

      // Проверяем, не добавлено ли уже
      const isBookmarked = bookmarks.some((b: any) => b.id === dua.id);

      if (isBookmarked) {
        // Удаляем из закладок
        const filtered = bookmarks.filter((b: any) => b.id !== dua.id);
        localStorage.setItem(bookmarksKey, JSON.stringify(filtered));
        setIsBookmarked(false);
        toast({
          title: "Удалено из избранного",
          description: "Дуа удалено из ваших закладок",
        });
      } else {
        // Добавляем в закладки
        const bookmark = {
          id: dua.id,
          arabic: dua.arabic,
          transcription: dua.transcription,
          russianTranscription: dua.russianTranscription,
          translation: dua.translation,
          reference: dua.reference,
          savedAt: new Date().toISOString(),
        };
        bookmarks.push(bookmark);
        localStorage.setItem(bookmarksKey, JSON.stringify(bookmarks));
        setIsBookmarked(true);
        toast({
          title: "Добавлено в избранное",
          description: "Дуа сохранено в ваших закладках",
        });
      }
    } catch (error) {
      console.error("Error saving bookmark:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить в закладки",
        variant: "destructive",
      });
    }
  };


  // Загрузка аудио из API, если не указано
  useEffect(() => {
    if (!dua.audioUrl && dua.id) {
      setIsLoadingAudio(true);
      // Пробуем загрузить аудио из API
      eReplikaAPI.getDuaAudio(dua.id)
        .then((url) => {
          if (url) {
            setAudioUrl(url);
          } else {
            // Если API вернул null, пробуем загрузить список всех дуа
            // и найти аудио по ID
            eReplikaAPI.getDuas()
              .then((duas) => {
                const foundDua = duas.find((d) => d.id === dua.id);
                if (foundDua && foundDua.audioUrl) {
                  setAudioUrl(foundDua.audioUrl);
                }
              })
              .catch((error) => {
                // Тихая ошибка - не показываем пользователю
                console.warn("Could not load audio from API:", error);
              });
          }
        })
        .catch((error) => {
          // Тихая ошибка - не показываем пользователю
          console.warn("Could not load audio from API:", error);
        })
        .finally(() => {
          setIsLoadingAudio(false);
        });
    }
  }, [dua.id, dua.audioUrl]);

  // Инициализация аудио
  useEffect(() => {
    // Если есть audioUrl, создаем HTML5 Audio элемент
    if (audioUrl) {
      const audio = new Audio(dua.audioUrl);
      audioRef.current = audio;

      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration);
      });

      audio.addEventListener("timeupdate", () => {
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      });

      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        setProgress(0);
      });

      audio.addEventListener("error", (e) => {
        console.error("Audio error:", e);
        toast({
          title: "Ошибка воспроизведения",
          description: "Не удалось загрузить аудио. Используется синтез речи.",
          variant: "destructive",
        });
      });

      return () => {
        audio.pause();
        audio.src = "";
        audioRef.current = null;
      };
    } else {
      audioRef.current = null;
    }
  }, [audioUrl, toast]);

  // Воспроизведение через синтез речи (fallback)
  const playWithTTS = useCallback(() => {
    if (!synthRef.current || !isTTSAvailable) {
      // Не показываем ошибку, просто не воспроизводим
      console.warn("Speech synthesis is not available");
      setIsPlaying(false);
      return;
    }

    // Останавливаем предыдущее воспроизведение
    synthRef.current.cancel();

    // Создаем utterance для арабского текста
    const arabicUtterance = new SpeechSynthesisUtterance(dua.arabic);
    arabicUtterance.lang = "ar-SA";
    arabicUtterance.rate = 0.75;
    arabicUtterance.volume = isMuted ? 0 : volume;
    arabicUtterance.pitch = 1;

    // Симуляция прогресса для TTS (приблизительно)
    const estimatedDuration = dua.arabic.length * 0.15; // Примерно 150мс на символ
    setDuration(estimatedDuration);
    
    let progressInterval: NodeJS.Timeout;
    const startTime = Date.now();

    arabicUtterance.onstart = () => {
      setIsPlaying(true);
      progressInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const newProgress = Math.min((elapsed / estimatedDuration) * 100, 100);
        setProgress(newProgress);
      }, 100);
    };

    arabicUtterance.onend = () => {
      setIsPlaying(false);
      setProgress(0);
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };

    arabicUtterance.onerror = (e) => {
      console.error("TTS error:", e);
      setIsPlaying(false);
      setProgress(0);
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      toast({
        title: "Ошибка синтеза речи",
        description: "Не удалось воспроизвести текст",
        variant: "destructive",
      });
    };

    synthRef.current.speak(arabicUtterance);
  }, [dua.arabic, isMuted, volume, isTTSAvailable]);

  // Останавливаем воспроизведение при размонтировании или смене дуа
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      setIsPlaying(false);
      setProgress(0);
    };
  }, [dua.id]);

  const togglePlay = () => {
    if (isPlaying) {
      // Пауза
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (synthRef.current) {
        if (synthRef.current.speaking) {
          synthRef.current.pause();
        } else if (synthRef.current.paused) {
          // Если уже на паузе, возобновляем
          synthRef.current.resume();
          setIsPlaying(true);
          return;
        } else {
          synthRef.current.cancel();
        }
      }
      setIsPlaying(false);
    } else {
      // Воспроизведение
      // Останавливаем все другие воспроизведения
      if (synthRef.current && synthRef.current.speaking) {
        synthRef.current.cancel();
      }

      // Если TTS на паузе, возобновляем
      if (synthRef.current && synthRef.current.paused) {
        synthRef.current.resume();
        setIsPlaying(true);
        return;
      }

      if (audioUrl && audioRef.current) {
        // Используем аудио файл
        audioRef.current.volume = isMuted ? 0 : volume;
        audioRef.current.play().catch((error) => {
          console.error("Play error:", error);
          // Fallback на TTS только если доступен
          if (isTTSAvailable) {
            playWithTTS();
          } else {
            setIsPlaying(false);
            toast({
              title: "Воспроизведение недоступно",
              description: "Аудио файл не загружен, а синтез речи не поддерживается браузером",
              variant: "destructive",
            });
          }
        });
        setIsPlaying(true);
      } else if (isTTSAvailable) {
        // Используем синтез речи только если доступен
        playWithTTS();
      } else {
        // Нет способа воспроизведения
        toast({
          title: "Воспроизведение недоступно",
          description: "Аудио файл не найден, а синтез речи не поддерживается вашим браузером",
          variant: "destructive",
        });
        setIsPlaying(false);
      }
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    audioRef.current.currentTime = newTime;
    setProgress(percentage * 100);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);

    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);

    if (audioRef.current) {
      audioRef.current.volume = newMuted ? 0 : volume;
    }

    // Для TTS нужно пересоздать utterance с новым volume
    if (synthRef.current && isPlaying) {
      synthRef.current.cancel();
      if (!newMuted) {
        playWithTTS();
      }
    }
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

        {/* Transcription (Latin) */}
        <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
          <p className="text-center text-lg text-foreground/90 italic">
            {dua.transcription}
          </p>
        </div>

        {/* Russian Transcription */}
        {dua.russianTranscription && (
          <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
            <p className="text-center text-base text-foreground/90">
              {dua.russianTranscription}
            </p>
          </div>
        )}

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
        <div className="space-y-3">
          <div className="text-sm font-medium text-foreground">Воспроизведение</div>
          <div className="flex items-center gap-2 bg-gradient-secondary rounded-xl p-3 border border-border/30">
            <Button
              size="icon"
              variant="ghost"
              onClick={togglePlay}
              disabled={!audioUrl && !isTTSAvailable && !isLoadingAudio}
              className="shrink-0 hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-primary" />
              ) : (
                <Play className="w-5 h-5 text-primary" />
              )}
            </Button>
            <div
              className="flex-1 h-2 bg-border/30 rounded-full overflow-hidden cursor-pointer relative group"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
              {duration > 0 && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-xs text-muted-foreground bg-background/90 px-2 py-1 rounded">
                    {Math.floor((progress / 100) * duration)}s / {Math.floor(duration)}s
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleMute}
                className="h-8 w-8 hover:bg-primary/10"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
              <div className="w-20">
                <Slider
                  value={[volume]}
                  onValueChange={handleVolumeChange}
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          {isLoadingAudio && (
            <p className="text-xs text-muted-foreground text-center">
              Загрузка аудио...
            </p>
          )}
          {!audioUrl && !isLoadingAudio && isTTSAvailable && (
            <p className="text-xs text-muted-foreground text-center">
              Используется синтез речи браузера
            </p>
          )}
          {!audioUrl && !isLoadingAudio && !isTTSAvailable && (
            <p className="text-xs text-muted-foreground text-center">
              Аудио файл не найден. Доступен только текст.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="hover:bg-primary/10 hover:text-primary transition-colors flex-shrink-0"
          >
            {isCopied ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            <span className="whitespace-nowrap">{isCopied ? "Скопировано" : "Копировать"}</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleBookmark}
            className={`transition-colors flex-shrink-0 ${
              isBookmarked
                ? "hover:bg-accent/10 text-accent"
                : "hover:bg-accent/10 hover:text-accent"
            }`}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4 mr-2 text-accent" />
            ) : (
              <BookmarkPlus className="w-4 h-4 mr-2" />
            )}
            <span className="whitespace-nowrap">
              {isBookmarked ? "В избранном" : "Сохранить"}
            </span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleShare}
            className="hover:bg-primary/10 hover:text-primary transition-colors flex-shrink-0"
          >
            <Share2 className="w-4 h-4 mr-2" />
            <span className="whitespace-nowrap">Поделиться</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
