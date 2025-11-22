import { useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { eReplikaAPI } from "@/lib/api";

// Constants
const TTS_ESTIMATED_CHAR_DURATION = 0.15; // seconds per character
const TTS_DEFAULT_RATE = 0.75;
const DEFAULT_VOLUME = 1;
const PROGRESS_UPDATE_INTERVAL = 100; // milliseconds

interface UseDuaAudioProps {
  duaId: string;
  arabicText: string;
  initialAudioUrl: string | null;
}

export function useDuaAudio({ duaId, arabicText, initialAudioUrl }: UseDuaAudioProps) {
  const { toast } = useToast();
  
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [isMuted, setIsMuted] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(initialAudioUrl);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isTTSAvailable, setIsTTSAvailable] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  
  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize TTS availability
  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      setIsTTSAvailable(false);
      return;
    }

    try {
      const synth = window.speechSynthesis;
      synthRef.current = synth;
      
      const checkVoices = () => {
        try {
          const voices = synth.getVoices();
          setIsTTSAvailable(voices.length > 0);
        } catch (error) {
          console.error("Error checking voices:", error);
          setIsTTSAvailable(false);
        }
      };

      checkVoices();
      synth.onvoiceschanged = checkVoices;
    } catch (error) {
      console.error("Error initializing TTS:", error);
      setIsTTSAvailable(false);
    }
  }, []);

  // Fetch audio URL
  useEffect(() => {
    if (initialAudioUrl || !duaId) return;

    let isCancelled = false;
    abortControllerRef.current = new AbortController();

    const fetchAudio = async () => {
      setIsLoadingAudio(true);
      setAudioError(null);

      try {
        const url = await eReplikaAPI.getDuaAudio(duaId);
        if (!isCancelled && url) {
          setAudioUrl(url);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error(`Error fetching audio for dua ${duaId}:`, error);
          setAudioError("Не удалось загрузить аудио");
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingAudio(false);
        }
      }
    };

    fetchAudio();

    return () => {
      isCancelled = true;
      abortControllerRef.current?.abort();
    };
  }, [duaId, initialAudioUrl]);

  // Initialize audio element
  useEffect(() => {
    if (!audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }

    const audio = new Audio(audioUrl);
    audio.preload = "auto";
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        const newProgress = (audio.currentTime / audio.duration) * 100;
        setProgress(newProgress);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };

    const handleError = (e: Event) => {
      const audioElement = e.target as HTMLAudioElement;
      const error = audioElement.error;
      
      let errorMessage = "Ошибка воспроизведения аудио";
      if (error) {
        switch (error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = "Воспроизведение прервано";
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = "Ошибка сети при загрузке аудио";
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = "Ошибка декодирования аудио";
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = "Формат аудио не поддерживается";
            break;
        }
      }
      
      setAudioError(errorMessage);
      setIsPlaying(false);
    };

    const handleCanPlay = () => {
      setAudioError(null);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("canplay", handleCanPlay);

    try {
      audio.load();
    } catch (error) {
      console.error(`Error loading audio for dua ${duaId}:`, error);
      setAudioError("Ошибка загрузки аудио");
    }

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.pause();
      audio.src = "";
      if (audioRef.current === audio) {
        audioRef.current = null;
      }
    };
  }, [audioUrl, duaId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setIsPlaying(false);
      setProgress(0);
    };
  }, [duaId]);

  // TTS playback function
  const playWithTTS = useCallback(() => {
    if (!synthRef.current || !isTTSAvailable) {
      console.warn("Speech synthesis is not available");
      setIsPlaying(false);
      return;
    }

    synthRef.current.cancel();

    const arabicUtterance = new SpeechSynthesisUtterance(arabicText);
    
    const voices = synthRef.current.getVoices();
    const arabicVoice = voices.find(voice => 
      voice.lang.startsWith('ar') || voice.lang.includes('Arabic')
    );
    
    if (arabicVoice) {
      arabicUtterance.voice = arabicVoice;
      arabicUtterance.lang = arabicVoice.lang;
    } else {
      arabicUtterance.lang = "ar-SA";
    }
    
    arabicUtterance.rate = TTS_DEFAULT_RATE;
    arabicUtterance.volume = isMuted ? 0 : volume;
    arabicUtterance.pitch = 1;

    const estimatedDuration = arabicText.length * TTS_ESTIMATED_CHAR_DURATION;
    setDuration(estimatedDuration);
    
    const startTime = Date.now();

    arabicUtterance.onstart = () => {
      setIsPlaying(true);
      progressIntervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const newProgress = Math.min((elapsed / estimatedDuration) * 100, 100);
        setProgress(newProgress);
      }, PROGRESS_UPDATE_INTERVAL);
    };

    arabicUtterance.onend = () => {
      setIsPlaying(false);
      setProgress(0);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };

    arabicUtterance.onerror = (e) => {
      const errorEvent = e as SpeechSynthesisErrorEvent;
      console.warn("TTS error:", errorEvent.error);
      setIsPlaying(false);
      setProgress(0);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };

    synthRef.current.speak(arabicUtterance);
  }, [arabicText, isMuted, volume, isTTSAvailable]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      // Pause
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (synthRef.current) {
        if (synthRef.current.speaking) {
          synthRef.current.pause();
        } else if (synthRef.current.paused) {
          synthRef.current.resume();
          setIsPlaying(true);
          return;
        } else {
          synthRef.current.cancel();
        }
      }
      setIsPlaying(false);
    } else {
      // Play
      if (synthRef.current && synthRef.current.speaking) {
        synthRef.current.cancel();
      }

      if (synthRef.current && synthRef.current.paused) {
        synthRef.current.resume();
        setIsPlaying(true);
        return;
      }

      if (audioUrl && audioRef.current) {
        try {
          if (audioRef.current.readyState < 2) {
            audioRef.current.addEventListener('canplay', () => {
              try {
                audioRef.current!.volume = isMuted ? 0 : volume;
                const playPromise = audioRef.current!.play();
                
                if (playPromise !== undefined) {
                  playPromise
                    .then(() => {
                      setIsPlaying(true);
                      setAudioError(null);
                    })
                    .catch((error) => {
                      console.error("Play error after canplay:", error);
                      setIsPlaying(false);
                      if (isTTSAvailable) {
                        playWithTTS();
                      } else {
                        setAudioError("Не удалось воспроизвести аудио. Попробуйте TTS.");
                        toast({
                          title: "Ошибка воспроизведения",
                          description: error.message || "Не удалось воспроизвести аудио файл",
                          variant: "destructive",
                        });
                      }
                    });
                } else {
                  setIsPlaying(true);
                }
              } catch (err) {
                console.error("Error in canplay handler:", err);
                if (isTTSAvailable) {
                  playWithTTS();
                }
              }
            }, { once: true });
            
            audioRef.current.load();
            return;
          }
          
          audioRef.current.volume = isMuted ? 0 : volume;
          const playPromise = audioRef.current.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setIsPlaying(true);
                setAudioError(null);
              })
              .catch((error) => {
                console.error("Play error:", error);
                setIsPlaying(false);
                
                if (isTTSAvailable) {
                  playWithTTS();
                } else {
                  setAudioError("Не удалось воспроизвести аудио");
                  toast({
                    title: "Ошибка воспроизведения",
                    description: error.message || "Аудио файл не загружен, а синтез речи не поддерживается",
                    variant: "destructive",
                  });
                }
              });
          } else {
            setIsPlaying(true);
          }
        } catch (error) {
          console.error("Error starting playback:", error);
          setIsPlaying(false);
          if (isTTSAvailable) {
            playWithTTS();
          } else {
            setAudioError("Ошибка при запуске воспроизведения");
          }
        }
      } else if (isTTSAvailable) {
        playWithTTS();
      } else {
        setIsPlaying(false);
        setAudioError("Аудио недоступно");
        toast({
          title: "Аудио недоступно",
          description: "Аудио файл не найден, а синтез речи не поддерживается браузером",
          variant: "destructive",
        });
      }
    }
  }, [isPlaying, audioUrl, isMuted, volume, isTTSAvailable, playWithTTS, toast]);

  // Progress click handler
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * duration;

    audioRef.current.currentTime = newTime;
    setProgress(percentage * 100);
  }, [duration]);

  // Volume change handler
  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);

    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);

    if (audioRef.current) {
      audioRef.current.volume = newMuted ? 0 : volume;
    }

    if (synthRef.current && isPlaying) {
      synthRef.current.cancel();
      if (!newMuted) {
        playWithTTS();
      } else {
        setIsPlaying(false);
      }
    }
  }, [isMuted, volume, isPlaying, playWithTTS]);

  // Check if audio is available
  const isAudioAvailable = audioUrl || isTTSAvailable;
  const canPlay = isAudioAvailable && !isLoadingAudio;

  return {
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
  };
}

