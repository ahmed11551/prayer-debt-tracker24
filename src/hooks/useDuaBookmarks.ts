import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

const BOOKMARKS_KEY = "prayer_debt_bookmarks";

export function useDuaBookmarks(duaId: string) {
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Check if dua is bookmarked
  useEffect(() => {
    const checkBookmark = () => {
      try {
        const existingBookmarks = localStorage.getItem(BOOKMARKS_KEY);
        if (existingBookmarks) {
          const bookmarks = JSON.parse(existingBookmarks);
          if (Array.isArray(bookmarks)) {
            setIsBookmarked(bookmarks.some((b: { id: string }) => b.id === duaId));
            return;
          }
        }
        setIsBookmarked(false);
      } catch (error) {
        console.error("Failed to parse bookmarks:", error);
        setIsBookmarked(false);
      }
    };
    
    checkBookmark();

    // Listen for bookmark updates from other components
    const handleBookmarksUpdate = () => {
      checkBookmark();
    };

    window.addEventListener('bookmarksUpdated', handleBookmarksUpdate);
    return () => {
      window.removeEventListener('bookmarksUpdated', handleBookmarksUpdate);
    };
  }, [duaId]);

  // Toggle bookmark
  const toggleBookmark = useCallback(() => {
    try {
      const existingBookmarks = localStorage.getItem(BOOKMARKS_KEY);
      let bookmarks: Array<{ id: string }> = [];
      
      if (existingBookmarks) {
        try {
          bookmarks = JSON.parse(existingBookmarks);
          if (!Array.isArray(bookmarks)) {
            bookmarks = [];
          }
        } catch {
          bookmarks = [];
        }
      }

      const isInBookmarks = bookmarks.some((b) => b.id === duaId);

      if (isInBookmarks) {
        const filtered = bookmarks.filter((b) => b.id !== duaId);
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(filtered));
        setIsBookmarked(false);
        window.dispatchEvent(new CustomEvent('bookmarksUpdated'));
        toast({
          title: "Удалено из избранного",
          description: "Дуа удалено из ваших закладок",
        });
      } else {
        bookmarks.push({ id: duaId });
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
        setIsBookmarked(true);
        window.dispatchEvent(new CustomEvent('bookmarksUpdated'));
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
  }, [duaId, toast]);

  return {
    isBookmarked,
    toggleBookmark,
  };
}

// Utility function to get all bookmarked dua IDs
export function getAllBookmarkedDuaIds(): string[] {
  try {
    const existingBookmarks = localStorage.getItem(BOOKMARKS_KEY);
    if (existingBookmarks) {
      const bookmarks = JSON.parse(existingBookmarks);
      if (Array.isArray(bookmarks)) {
        return bookmarks.map((b: { id: string }) => b.id);
      }
    }
  } catch (error) {
    console.error("Failed to get bookmarks:", error);
  }
  return [];
}

