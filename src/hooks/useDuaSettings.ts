import { useState, useEffect, useCallback } from "react";

export interface DuaSettings {
  arabicFontSize: number; // 1-5 (small to large)
  showTranscription: boolean;
  showTranslation: boolean;
  translationLanguage: "ru" | "en" | "ar" | "kz" | "kg" | "uz" | "az" | "tj" | "tm";
  transcriptionType: "latin" | "cyrillic" | "both";
}

const DEFAULT_SETTINGS: DuaSettings = {
  arabicFontSize: 3, // Medium
  showTranscription: true,
  showTranslation: true,
  translationLanguage: "ru",
  transcriptionType: "both",
};

const STORAGE_KEY = "dua_display_settings";

export function useDuaSettings() {
  const [settings, setSettings] = useState<DuaSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error("Failed to load dua settings:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save settings to localStorage
  const updateSettings = useCallback((newSettings: Partial<DuaSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Failed to save dua settings:", error);
      }
      return updated;
    });
  }, []);

  // Get font size class
  const getArabicFontSizeClass = useCallback(() => {
    const sizes = {
      1: "text-2xl", // Small
      2: "text-3xl", // Medium-small
      3: "text-4xl", // Medium (default)
      4: "text-5xl", // Large
      5: "text-6xl", // Extra large
    };
    return sizes[settings.arabicFontSize as keyof typeof sizes] || sizes[3];
  }, [settings.arabicFontSize]);

  return {
    settings,
    updateSettings,
    getArabicFontSizeClass,
    isLoaded,
  };
}



