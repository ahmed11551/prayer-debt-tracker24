import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Repeat, Sun, Moon } from "lucide-react";
import { AdhkarCard } from "./AdhkarCard";

export const AdhkarSection = () => {
  const adhkar = [
    {
      id: "tasbih",
      title: "Тасбих",
      icon: Repeat,
      color: "primary",
      text: "سُبْحَانَ اللَّهِ",
      transcription: "Subhanallah",
      translation: "Свят Аллах",
      count: 33,
      category: "После намаза",
    },
    {
      id: "tahmid",
      title: "Тахмид",
      icon: Sun,
      color: "accent",
      text: "الْحَمْدُ لِلَّهِ",
      transcription: "Alhamdulillah",
      translation: "Хвала Аллаху",
      count: 33,
      category: "После намаза",
    },
    {
      id: "takbir",
      title: "Такбир",
      icon: Moon,
      color: "category-prayer",
      text: "اللَّهُ أَكْبَرُ",
      transcription: "Allahu Akbar",
      translation: "Аллах Велик",
      count: 34,
      category: "После намаза",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <Card className="glass shadow-medium border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl gradient-text">Азкары</CardTitle>
          <CardDescription>
            Поминание Аллаха с счётчиком повторений
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {adhkar.map((dhikr) => (
          <AdhkarCard key={dhikr.id} dhikr={dhikr} />
        ))}
      </div>

      <Card className="border-accent/30 bg-accent/5">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            <strong className="text-accent">Примечание:</strong> Рекомендуется произносить эти азкары после каждого обязательного намаза.
            Нажмите на карточку, чтобы начать счёт.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
