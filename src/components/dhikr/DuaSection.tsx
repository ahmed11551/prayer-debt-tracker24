import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Moon, Sun, Sunrise, Sunset, Plane, Heart } from "lucide-react";
import { DuaCard } from "./DuaCard";

export const DuaSection = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      id: "sleep",
      name: "Перед сном",
      icon: Moon,
      color: "category-sleep",
      duas: [
        {
          id: "sleep-1",
          arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
          transcription: "Bismika Allahumma amutu wa ahya",
          translation: "С именем Твоим, О Аллах, я умираю и оживаю",
          reference: "Сахих аль-Бухари 6314",
          audioUrl: null,
        },
        {
          id: "sleep-2",
          arabic: "اللَّهُمَّ إِنِّي أَسْلَمْتُ نَفْسِي إِلَيْكَ",
          transcription: "Allahumma inni aslamtu nafsi ilayka",
          translation: "О Аллах, я предал свою душу Тебе",
          reference: "Сахих аль-Бухари 247",
          audioUrl: null,
        },
      ],
    },
    {
      id: "morning",
      name: "Утренние",
      icon: Sunrise,
      color: "category-morning",
      duas: [
        {
          id: "morning-1",
          arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ",
          transcription: "Asbahna wa asbahal-mulku lillah",
          translation: "Мы вступили в утро, и владычество принадлежит Аллаху",
          reference: "Сахих Муслим 2723",
          audioUrl: null,
        },
      ],
    },
    {
      id: "evening",
      name: "Вечерние",
      icon: Sunset,
      color: "category-evening",
      duas: [
        {
          id: "evening-1",
          arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ",
          transcription: "Amsayna wa amsal-mulku lillah",
          translation: "Мы вступили в вечер, и владычество принадлежит Аллаху",
          reference: "Сахих Муслим 2723",
          audioUrl: null,
        },
      ],
    },
    {
      id: "prayer",
      name: "После намаза",
      icon: Sun,
      color: "category-prayer",
      duas: [
        {
          id: "prayer-1",
          arabic: "أَسْتَغْفِرُ اللَّهَ (ثَلاثًا)",
          transcription: "Astaghfirullah (3 раза)",
          translation: "Прошу прощения у Аллаха",
          reference: "Сахих Муслим 591",
          audioUrl: null,
        },
        {
          id: "prayer-2",
          arabic: "اللَّهُمَّ أَنْتَ السَّلامُ وَمِنْكَ السَّلامُ",
          transcription: "Allahumma antas-salam wa minkas-salam",
          translation: "О Аллах, Ты — Мир, и от Тебя — мир",
          reference: "Сахих Муслим 592",
          audioUrl: null,
        },
      ],
    },
    {
      id: "hajj",
      name: "В хадже",
      icon: Plane,
      color: "category-hajj",
      duas: [
        {
          id: "hajj-1",
          arabic: "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ",
          transcription: "Labbayka Allahumma labbayk",
          translation: "Вот я перед Тобой, О Аллах, вот я перед Тобой",
          reference: "Сахих аль-Бухари 1549",
          audioUrl: null,
        },
      ],
    },
    {
      id: "general",
      name: "Общие",
      icon: Heart,
      color: "category-general",
      duas: [
        {
          id: "general-1",
          arabic: "الْحَمْدُ لِلَّهِ",
          transcription: "Alhamdulillah",
          translation: "Хвала Аллаху",
          reference: "Коран 1:2",
          audioUrl: null,
        },
      ],
    },
  ];

  const filteredCategories = categories.map(category => ({
    ...category,
    duas: category.duas.filter(dua =>
      dua.arabic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dua.transcription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dua.translation.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.duas.length > 0);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Search Bar */}
      <Card className="glass shadow-medium border-border/50">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Поиск по дуа..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50 border-border/50 focus:border-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      {filteredCategories.length === 0 ? (
        <Card className="glass shadow-medium">
          <CardContent className="pt-6 text-center text-muted-foreground">
            Ничего не найдено. Попробуйте другой запрос.
          </CardContent>
        </Card>
      ) : (
        filteredCategories.map((category) => (
          <div key={category.id} className="space-y-4">
            <Card className="glass shadow-medium border-border/50 overflow-hidden">
              <div className={`h-1 bg-gradient-to-r from-${category.color} to-transparent`} />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-${category.color}/10 flex items-center justify-center`}>
                    <category.icon className={`w-6 h-6 text-${category.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{category.name}</CardTitle>
                    <CardDescription>{category.duas.length} дуа</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="space-y-4">
              {category.duas.map((dua) => (
                <DuaCard key={dua.id} dua={dua} categoryColor={category.color} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
