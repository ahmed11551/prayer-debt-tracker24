import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DuaCard } from "./DuaCard";

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

interface DuaSearchResultsProps {
  results: DuaItem[];
  onDuaClick: (dua: DuaItem) => void;
}

export const DuaSearchResults = memo(({ results, onDuaClick }: DuaSearchResultsProps) => {
  if (results.length === 0) {
    return (
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Дуа не найдены</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-gray-900">
          Найдено: {results.length} {results.length === 1 ? "дуа" : "дуа"}
        </h3>
      </div>
      
      <div className="space-y-4">
        {results.map((dua) => (
          <div
            key={dua.id}
            className="cursor-pointer"
            onClick={() => onDuaClick(dua)}
          >
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-2">
                  {dua.title && (
                    <h4 className="font-semibold text-sm text-gray-900">{dua.title}</h4>
                  )}
                  <p className="text-sm text-gray-700 line-clamp-2" dir="rtl">
                    {dua.arabic}
                  </p>
                  {dua.transcription && (
                    <p className="text-xs text-gray-500 italic line-clamp-1">
                      {dua.transcription}
                    </p>
                  )}
                  {dua.translation && (
                    <p className="text-xs text-gray-600 line-clamp-1">
                      {dua.translation}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 italic">{dua.reference}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
});

DuaSearchResults.displayName = "DuaSearchResults";

