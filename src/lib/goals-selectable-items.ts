// Утилита для получения всех доступных элементов для выбора в целях

import type { SelectableItem, GoalCategory } from "@/types/goals";
import { eReplikaAPI } from "@/lib/api";
import { ASMAUL_HUSNA } from "@/data/asmaul-husna";
import { QURAN_SURAHS } from "@/data/quran-surahs";

// Кэш для данных из API
let cachedData: {
  duas?: any[];
  adhkar?: any[];
  salawat?: any[];
  kalimas?: any[];
  asmaulHusna?: any[];
  timestamp?: number;
} = {};

const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

// Загрузка данных из API с кэшированием
async function loadDataFromAPI(category: GoalCategory) {
  const now = Date.now();
  
  // Проверяем кэш
  if (cachedData.timestamp && (now - cachedData.timestamp) < CACHE_DURATION) {
    return cachedData;
  }

  try {
    // Загружаем данные параллельно
    const [duasData, adhkarData, salawatData, kalimasData, asmaulHusnaData] = await Promise.allSettled([
      category === "zikr" || category === "quran" ? eReplikaAPI.getDuas() : Promise.resolve([]),
      category === "zikr" ? eReplikaAPI.getAdhkar() : Promise.resolve([]),
      category === "zikr" ? eReplikaAPI.getSalawat() : Promise.resolve([]),
      category === "zikr" ? eReplikaAPI.getKalimas() : Promise.resolve([]),
      category === "asmaul_husna" ? eReplikaAPI.getAsmaulHusna() : Promise.resolve([]),
    ]);

    cachedData = {
      duas: duasData.status === "fulfilled" ? duasData.value : [],
      adhkar: adhkarData.status === "fulfilled" ? adhkarData.value : [],
      salawat: salawatData.status === "fulfilled" ? salawatData.value : [],
      kalimas: kalimasData.status === "fulfilled" ? kalimasData.value : [],
      asmaulHusna: asmaulHusnaData.status === "fulfilled" ? asmaulHusnaData.value : [],
      timestamp: now,
    };
  } catch (error) {
    console.error("Error loading data from API:", error);
    // Используем старый кэш, если есть
  }

  return cachedData;
}

// Данные для выбора (загружаются из API с fallback на статические данные)
export async function getSelectableItemsAsync(category: GoalCategory): Promise<SelectableItem[]> {
  const items: SelectableItem[] = [];

  switch (category) {
    case "prayer":
      // Типы намазов
      items.push(
        {
          id: "prayer-tahajjud",
          title: "Тахаджуд",
          category: "prayer",
          type: "prayer",
        },
        {
          id: "prayer-istighfar",
          title: "Истигфар",
          category: "prayer",
          type: "prayer",
        },
        {
          id: "prayer-sunnah",
          title: "Сунна намаз",
          category: "prayer",
          type: "prayer",
        },
        {
          id: "prayer-qaza",
          title: "Каза (восполнение)",
          category: "prayer",
          type: "prayer",
        }
      );
      break;

    case "quran":
      // Все 114 сур Корана
      QURAN_SURAHS.forEach((surah) => {
        items.push({
          id: `surah-${surah.number}`,
          title: `${surah.number}. ${surah.name} (${surah.ayahsCount} аятов)`,
          category: "quran",
          type: "surah",
          surah_number: surah.number,
        });
      });

      // Популярные аяты для быстрого выбора
      const popularAyahs = [
        { surah: 1, ayah: 1, title: "Аль-Фатиха, аят 1" },
        { surah: 2, ayah: 255, title: "Аят аль-Курси" },
        { surah: 2, ayah: 286, title: "Аль-Бакара, последний аят" },
        { surah: 36, ayah: 1, title: "Йа Син, начало" },
        { surah: 55, ayah: 1, title: "Ар-Рахман, начало" },
        { surah: 67, ayah: 1, title: "Аль-Мульк, начало" },
        { surah: 112, ayah: 1, title: "Аль-Ихлас" },
      ];

      popularAyahs.forEach((ayah) => {
        items.push({
          id: `ayah-${ayah.surah}-${ayah.ayah}`,
          title: ayah.title,
          category: "quran",
          type: "ayah",
          surah_number: ayah.surah,
          ayah_number: ayah.ayah,
        });
      });

      // Опция для выбора произвольного аята
      items.push({
        id: "ayah-custom",
        title: "Выбрать конкретный аят...",
        category: "quran",
        type: "ayah",
      });
      break;

    case "zikr":
      // Дуа
      const duaCategories = [
        {
          id: "sleep",
          name: "Перед сном",
          duas: [
            { id: "sleep-1", arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", transcription: "Bismika Allahumma amutu wa ahya", russianTranscription: "Бисмика Аллахумма амуту ва ахья", translation: "С именем Твоим, О Аллах, я умираю и оживаю" },
            { id: "sleep-2", arabic: "اللَّهُمَّ إِنِّي أَسْلَمْتُ نَفْسِي إِلَيْكَ", transcription: "Allahumma inni aslamtu nafsi ilayka", russianTranscription: "Аллахумма инни аслямту нафси иляйка", translation: "О Аллах, я предал свою душу Тебе" },
          ],
        },
        {
          id: "morning",
          name: "Утренние",
          duas: [
            { id: "morning-1", arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ", transcription: "Asbahna wa asbahal-mulku lillah", russianTranscription: "Асбахна ва асбахаль-мульку лиллах", translation: "Мы вступили в утро, и владычество принадлежит Аллаху" },
          ],
        },
      ];

      duaCategories.forEach((cat) => {
        cat.duas.forEach((dua) => {
          items.push({
            id: dua.id,
            title: `${cat.name}: ${dua.translation.substring(0, 30)}...`,
            text: dua.arabic,
            transcription: dua.transcription,
            russianTranscription: dua.russianTranscription,
            translation: dua.translation,
            category: "zikr",
            type: "dua",
          });
        });
      });

      // Азкары
      const adhkarItems = [
        { id: "tasbih", title: "Тасбих", text: "سُبْحَانَ اللَّهِ", transcription: "Subhanallah", russianTranscription: "Субханаллах", translation: "Свят Аллах" },
        { id: "tahmid", title: "Тахмид", text: "الْحَمْدُ لِلَّهِ", transcription: "Alhamdulillah", russianTranscription: "Альхамдулиллах", translation: "Хвала Аллаху" },
        { id: "takbir", title: "Такбир", text: "اللَّهُ أَكْبَرُ", transcription: "Allahu Akbar", russianTranscription: "Аллаху Акбар", translation: "Аллах Велик" },
      ];

      adhkarItems.forEach((item) => {
        items.push({
          id: item.id,
          title: item.title,
          text: item.text,
          transcription: item.transcription,
          russianTranscription: item.russianTranscription,
          translation: item.translation,
          category: "zikr",
          type: "adhkar",
        });
      });

      // Салаваты
      const salawatItems = [
        { id: "salawat-1", arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ", transcription: "Allahumma salli 'ala Muhammad", russianTranscription: "Аллахумма салли 'аля Мухаммад", translation: "О Аллах, благослови Мухаммада" },
        { id: "salawat-2", arabic: "اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ", transcription: "Allahumma barik 'ala Muhammad", russianTranscription: "Аллахумма барик 'аля Мухаммад", translation: "О Аллах, пошли благословение Мухаммаду" },
      ];

      salawatItems.forEach((item) => {
        items.push({
          id: item.id,
          title: `Салават: ${item.translation.substring(0, 30)}...`,
          text: item.arabic,
          transcription: item.transcription,
          russianTranscription: item.russianTranscription,
          translation: item.translation,
          category: "zikr",
          type: "salawat",
        });
      });

      // Калимы
      const kalimaItems = [
        { id: "kalima-1", arabic: "لَا إِلَٰهَ إِلَّا ٱللَّٰهُ", transcription: "La ilaha illallah", russianTranscription: "Ля иляха илляллах", translation: "Нет божества, кроме Аллаха" },
        { id: "kalima-2", arabic: "أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا ٱللَّٰهُ", transcription: "Ash-hadu an la ilaha illallah", russianTranscription: "Ашхаду ан ля иляха илляллах", translation: "Свидетельствую, что нет божества, кроме Аллаха" },
      ];

      kalimaItems.forEach((item) => {
        items.push({
          id: item.id,
          title: `Калима: ${item.translation.substring(0, 30)}...`,
          text: item.arabic,
          transcription: item.transcription,
          russianTranscription: item.russianTranscription,
          translation: item.translation,
          category: "zikr",
          type: "kalima",
        });
      });
      break;

    case "asmaul_husna":
      // 99 имен Аллаха - загружаем из файла данных
      ASMAUL_HUSNA.forEach((asma) => {
        items.push({
          id: asma.id,
          title: `${asma.number}. ${asma.transcription} - ${asma.translation}`,
          text: asma.arabic,
          transcription: asma.transcription,
          translation: asma.translation,
          category: "asmaul_husna",
          type: "asmaul_husna",
        });
      });
      break;

    case "knowledge":
      items.push(
        {
          id: "knowledge-alifba",
          title: "Алифба (Арабский алфавит)",
          category: "knowledge",
          type: "knowledge",
        },
        {
          id: "knowledge-tajweed",
          title: "Таджвид (Правила чтения Корана)",
          category: "knowledge",
          type: "knowledge",
        },
        {
          id: "knowledge-book-custom",
          title: "Выбрать книгу",
          category: "knowledge",
          type: "knowledge",
        }
      );
      break;

    case "sadaqa":
      // Для садаки не нужен выбор конкретного элемента
      break;
  }

  return items;
}

// Синхронная версия для использования в компонентах (только статические данные)
export function getSelectableItems(category: GoalCategory): SelectableItem[] {
  const items: SelectableItem[] = [];

  switch (category) {
    case "prayer":
      items.push(
        {
          id: "prayer-tahajjud",
          title: "Тахаджуд",
          category: "prayer",
          type: "prayer",
        },
        {
          id: "prayer-istighfar",
          title: "Истигфар",
          category: "prayer",
          type: "prayer",
        },
        {
          id: "prayer-sunnah",
          title: "Сунна намаз",
          category: "prayer",
          type: "prayer",
        },
        {
          id: "prayer-qaza",
          title: "Каза (восполнение)",
          category: "prayer",
          type: "prayer",
        }
      );
      break;

    case "quran":
      // Все 114 сур Корана
      QURAN_SURAHS.forEach((surah) => {
        items.push({
          id: `surah-${surah.number}`,
          title: `${surah.number}. ${surah.name} (${surah.ayahsCount} аятов)`,
          category: "quran",
          type: "surah",
          surah_number: surah.number,
        });
      });

      // Популярные аяты для быстрого выбора
      const popularAyahs = [
        { surah: 1, ayah: 1, title: "Аль-Фатиха, аят 1" },
        { surah: 2, ayah: 255, title: "Аят аль-Курси" },
        { surah: 2, ayah: 286, title: "Аль-Бакара, последний аят" },
        { surah: 36, ayah: 1, title: "Йа Син, начало" },
        { surah: 55, ayah: 1, title: "Ар-Рахман, начало" },
        { surah: 67, ayah: 1, title: "Аль-Мульк, начало" },
        { surah: 112, ayah: 1, title: "Аль-Ихлас" },
      ];

      popularAyahs.forEach((ayah) => {
        items.push({
          id: `ayah-${ayah.surah}-${ayah.ayah}`,
          title: ayah.title,
          category: "quran",
          type: "ayah",
          surah_number: ayah.surah,
          ayah_number: ayah.ayah,
        });
      });

      // Опция для выбора произвольного аята
      items.push({
        id: "ayah-custom",
        title: "Выбрать конкретный аят...",
        category: "quran",
        type: "ayah",
      });
      break;

    case "asmaul_husna":
      ASMAUL_HUSNA.forEach((asma) => {
        items.push({
          id: asma.id,
          title: `${asma.number}. ${asma.transcription} - ${asma.translation}`,
          text: asma.arabic,
          transcription: asma.transcription,
          translation: asma.translation,
          category: "asmaul_husna",
          type: "asmaul_husna",
        });
      });
      break;

    default:
      // Для остальных категорий возвращаем пустой массив
      break;
  }

  return items;
}

