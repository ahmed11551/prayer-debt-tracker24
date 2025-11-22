// Хук для загрузки данных зикров из API

import { useState, useEffect, useCallback } from "react";
import { eReplikaAPI } from "@/lib/api";

interface DuaData {
  id: string;
  arabic: string;
  transcription: string;
  russianTranscription?: string;
  translation: string;
  reference?: string;
  audioUrl: string | null;
}

interface AdhkarData {
  id: string;
  title: string;
  text: string;
  transcription: string;
  russianTranscription?: string;
  translation: string;
  count: number;
}

interface SalawatData {
  id: string;
  arabic: string;
  transcription: string;
  russianTranscription?: string;
  translation: string;
  reference?: string;
}

interface KalimaData {
  id: string;
  arabic: string;
  transcription: string;
  russianTranscription?: string;
  translation: string;
  reference?: string;
}

interface AsmaulHusnaData {
  id: string;
  arabic: string;
  transcription: string;
  translation: string;
  number?: number;
}

export function useDhikrData() {
  const [duas, setDuas] = useState<DuaData[]>([]);
  const [adhkar, setAdhkar] = useState<AdhkarData[]>([]);
  const [salawat, setSalawat] = useState<SalawatData[]>([]);
  const [kalimas, setKalimas] = useState<KalimaData[]>([]);
  const [asmaulHusna, setAsmaulHusna] = useState<AsmaulHusnaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Загружаем данные параллельно
      const [duasData, adhkarData, salawatData, kalimasData, asmaulHusnaData] = await Promise.allSettled([
        eReplikaAPI.getDuas(),
        eReplikaAPI.getAdhkar(),
        eReplikaAPI.getSalawat(),
        eReplikaAPI.getKalimas(),
        eReplikaAPI.getAsmaulHusna(),
      ]);

      // Обрабатываем дуа
      if (duasData.status === "fulfilled") {
        // Преобразуем формат API в нужный формат
        const formattedDuas = duasData.value.map((dua: any) => ({
          id: dua.id || dua.dua_id,
          arabic: dua.arabic || dua.text || "",
          transcription: dua.transcription || dua.transliteration || "",
          russianTranscription: dua.russian_transcription || dua.russianTranscription,
          translation: dua.translation || "",
          reference: dua.reference || "",
          audioUrl: dua.audioUrl || dua.audio_url || null,
        }));
        setDuas(formattedDuas);
      }

      // Обрабатываем азкары
      if (adhkarData.status === "fulfilled") {
        const formattedAdhkar = adhkarData.value.map((item: any) => ({
          id: item.id,
          title: item.title || item.name || "",
          text: item.text || item.arabic || "",
          transcription: item.transcription || item.transliteration || "",
          russianTranscription: item.russian_transcription || item.russianTranscription,
          translation: item.translation || "",
          count: item.count || 33,
        }));
        setAdhkar(formattedAdhkar);
      }

      // Обрабатываем салаваты
      if (salawatData.status === "fulfilled") {
        const formattedSalawat = salawatData.value.map((item: any) => ({
          id: item.id,
          arabic: item.arabic || item.text || "",
          transcription: item.transcription || item.transliteration || "",
          russianTranscription: item.russian_transcription || item.russianTranscription,
          translation: item.translation || "",
          reference: item.reference || "",
        }));
        setSalawat(formattedSalawat);
      }

      // Обрабатываем калимы
      if (kalimasData.status === "fulfilled") {
        const formattedKalimas = kalimasData.value.map((item: any) => ({
          id: item.id,
          arabic: item.arabic || item.text || "",
          transcription: item.transcription || item.transliteration || "",
          russianTranscription: item.russian_transcription || item.russianTranscription,
          translation: item.translation || "",
          reference: item.reference || "",
        }));
        setKalimas(formattedKalimas);
      }

      // Обрабатываем 99 имен Аллаха
      if (asmaulHusnaData.status === "fulfilled") {
        const formattedAsmaulHusna = asmaulHusnaData.value.map((item: any, index: number) => ({
          id: item.id || `asma-${index + 1}`,
          arabic: item.arabic || item.text || "",
          transcription: item.transcription || item.transliteration || "",
          translation: item.translation || item.meaning || "",
          number: item.number || index + 1,
        }));
        setAsmaulHusna(formattedAsmaulHusna);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load dhikr data");
      setError(error);
      console.error("Error loading dhikr data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    duas,
    adhkar,
    salawat,
    kalimas,
    asmaulHusna,
    loading,
    error,
    reload: loadData,
  };
}

