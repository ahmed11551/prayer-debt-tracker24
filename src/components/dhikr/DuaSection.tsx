import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Moon, Sun, Sunrise, Sunset, Plane, Heart, Utensils, Car, Home, ChevronDown, ChevronUp } from "lucide-react";
import { DuaCard } from "./DuaCard";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  duas: Array<{
    id: string;
    arabic: string;
    transcription: string;
    russianTranscription?: string;
    translation: string;
    reference: string;
    audioUrl: string | null;
  }>;
}

export const DuaSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const categories: Category[] = [
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
          russianTranscription: "Бисмика Аллахумма амуту ва ахья",
          translation: "С именем Твоим, О Аллах, я умираю и оживаю",
          reference: "Сахих аль-Бухари 6314",
          audioUrl: null,
        },
        {
          id: "sleep-2",
          arabic: "اللَّهُمَّ إِنِّي أَسْلَمْتُ نَفْسِي إِلَيْكَ",
          transcription: "Allahumma inni aslamtu nafsi ilayka",
          russianTranscription: "Аллахумма инни аслямту нафси иляйка",
          translation: "О Аллах, я предал свою душу Тебе",
          reference: "Сахих аль-Бухари 247",
          audioUrl: null,
        },
        {
          id: "sleep-3",
          arabic: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ",
          transcription: "Allahumma qini 'adhabaka yawma tab'athu 'ibadak",
          russianTranscription: "Аллахумма кини 'азабака явма таб'асу 'ибадак",
          translation: "О Аллах, защити меня от Твоего наказания в день, когда Ты воскресишь Своих рабов",
          reference: "Сахих Абу Дауд 5046",
          audioUrl: null,
        },
        {
          id: "sleep-4",
          arabic: "اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا",
          transcription: "Allahumma bismika amutu wa ahya",
          russianTranscription: "Аллахумма бисмика амуту ва ахья",
          translation: "О Аллах, с Твоим именем я умираю и оживаю",
          reference: "Сахих аль-Бухари 6324",
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
          russianTranscription: "Асбахна ва асбахаль-мульку лиллах",
          translation: "Мы вступили в утро, и владычество принадлежит Аллаху",
          reference: "Сахих Муслим 2723",
          audioUrl: null,
        },
        {
          id: "morning-2",
          arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",
          transcription: "Allahumma bika asbahna wa bika amsayna wa bika nahya wa bika namutu wa ilaykan-nushur",
          russianTranscription: "Аллахумма бика асбахна ва бика амсайна ва бика нахья ва бика намуту ва иляйкан-нушур",
          translation: "О Аллах, с Тобой мы вступили в утро, с Тобой мы вступили в вечер, с Тобой мы живём, с Тобой мы умираем, и к Тебе воскрешение",
          reference: "Сахих Ат-Тирмизи 3391",
          audioUrl: null,
        },
        {
          id: "morning-3",
          arabic: "اللَّهُمَّ أَصْبَحْنَا نُشْهِدُكَ وَنُشْهِدُ حَمَلَةَ عَرْشِكَ",
          transcription: "Allahumma asbahna nushhiduka wa nushhidu hamalata 'arshik",
          russianTranscription: "Аллахумма асбахна нушихдука ва нушихду хамалята 'аршик",
          translation: "О Аллах, мы вступили в утро, свидетельствуя Тебя и свидетельствуя носителей Твоего Трона",
          reference: "Сахих Ат-Тирмизи 3392",
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
          russianTranscription: "Амсайна ва амсаль-мульку лиллах",
          translation: "Мы вступили в вечер, и владычество принадлежит Аллаху",
          reference: "Сахих Муслим 2723",
          audioUrl: null,
        },
        {
          id: "evening-2",
          arabic: "اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ",
          transcription: "Allahumma bika amsayna wa bika asbahna wa bika nahya wa bika namutu wa ilaykal-masir",
          russianTranscription: "Аллахумма бика амсайна ва бика асбахна ва бика нахья ва бика намуту ва иляйкаль-масир",
          translation: "О Аллах, с Тобой мы вступили в вечер, с Тобой мы вступили в утро, с Тобой мы живём, с Тобой мы умираем, и к Тебе возвращение",
          reference: "Сахих Ат-Тирмизи 3391",
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
          russianTranscription: "Астагфируллах (3 раза)",
          translation: "Прошу прощения у Аллаха",
          reference: "Сахих Муслим 591",
          audioUrl: null,
        },
        {
          id: "prayer-2",
          arabic: "اللَّهُمَّ أَنْتَ السَّلامُ وَمِنْكَ السَّلامُ",
          transcription: "Allahumma antas-salam wa minkas-salam",
          russianTranscription: "Аллахумма антас-саляму ва минкас-салям",
          translation: "О Аллах, Ты — Мир, и от Тебя — мир",
          reference: "Сахих Муслим 592",
          audioUrl: null,
        },
        {
          id: "prayer-3",
          arabic: "اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ وَلَا مُعْطِيَ لِمَا مَنَعْتَ",
          transcription: "Allahumma la mani'a lima a'tayta wa la mu'tiya lima mana'ta",
          russianTranscription: "Аллахумма ля мани'а лима а'тайта ва ля му'тия лима мана'та",
          translation: "О Аллах, нет препятствующего тому, что Ты дал, и нет дающего тому, что Ты удержал",
          reference: "Сахих аль-Бухари 844",
          audioUrl: null,
        },
        {
          id: "prayer-4",
          arabic: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
          transcription: "Allahumma a'inni 'ala dhikrika wa shukrika wa husni 'ibadatik",
          russianTranscription: "Аллахумма а'инни 'аля зикрика ва шукрика ва хусни 'ибадатик",
          translation: "О Аллах, помоги мне поминать Тебя, благодарить Тебя и хорошо поклоняться Тебе",
          reference: "Сахих Абу Дауд 1522",
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
          russianTranscription: "Лаббайка Аллахумма лаббайк",
          translation: "Вот я перед Тобой, О Аллах, вот я перед Тобой",
          reference: "Сахих аль-Бухари 1549",
          audioUrl: null,
        },
        {
          id: "hajj-2",
          arabic: "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ",
          transcription: "Labbayka Allahumma labbayk, labbayk la sharika lak labbayk",
          russianTranscription: "Лаббайка Аллахумма лаббайк, лаббайк ля шарика лак лаббайк",
          translation: "Вот я перед Тобой, О Аллах, вот я перед Тобой. Нет у Тебя сотоварища, вот я перед Тобой",
          reference: "Сахих аль-Бухари 1549",
          audioUrl: null,
        },
        {
          id: "hajj-3",
          arabic: "اللَّهُمَّ إِنِّي أُرِيدُ الْحَجَّ فَيَسِّرْهُ لِي",
          transcription: "Allahumma inni uridul-hajja fa yassirhu li",
          russianTranscription: "Аллахумма инни уридуль-хаджжа фа яссирху ли",
          translation: "О Аллах, я желаю совершить хадж, облегчи его мне",
          reference: "Сахих Муслим 1181",
          audioUrl: null,
        },
      ],
    },
    {
      id: "food",
      name: "Перед едой",
      icon: Utensils,
      color: "category-general",
      duas: [
        {
          id: "food-1",
          arabic: "بِسْمِ اللَّهِ",
          transcription: "Bismillah",
          russianTranscription: "Бисмиллах",
          translation: "С именем Аллаха",
          reference: "Сахих аль-Бухари 5376",
          audioUrl: null,
        },
        {
          id: "food-2",
          arabic: "بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ",
          transcription: "Bismillahi wa 'ala barakatillah",
          russianTranscription: "Бисмиллахи ва 'аля баракатиллах",
          translation: "С именем Аллаха и с благословением Аллаха",
          reference: "Сахих Абу Дауд 3767",
          audioUrl: null,
        },
      ],
    },
    {
      id: "travel",
      name: "В путешествии",
      icon: Car,
      color: "category-hajj",
      duas: [
        {
          id: "travel-1",
          arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ",
          transcription: "Subhanalladhi sakhkhara lana hadha wa ma kunna lahu muqrinin",
          russianTranscription: "Субханаллязи саххара ляна хаза ва ма кунна ляху мукринин",
          translation: "Свят Тот, Кто подчинил нам это, а мы не были способны на это",
          reference: "Сахих Муслим 1342",
          audioUrl: null,
        },
        {
          id: "travel-2",
          arabic: "اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى",
          transcription: "Allahumma inni nas'aluka fi safarina hadhal-birra wat-taqwa",
          russianTranscription: "Аллахумма инна нас'алюка фи сафарина хазаль-бирра ват-таква",
          translation: "О Аллах, мы просим Тебя в этом нашем путешествии о благочестии и богобоязненности",
          reference: "Сахих Муслим 1342",
          audioUrl: null,
        },
      ],
    },
    {
      id: "home",
      name: "При входе/выходе",
      icon: Home,
      color: "category-prayer",
      duas: [
        {
          id: "home-1",
          arabic: "بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا",
          transcription: "Bismillahi walajna wa bismillahi kharajna",
          russianTranscription: "Бисмиллахи валяджна ва бисмиллахи хараджна",
          translation: "С именем Аллаха мы вошли и с именем Аллаха мы вышли",
          reference: "Сахих Абу Дауд 5096",
          audioUrl: null,
        },
        {
          id: "home-2",
          arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلِجِ وَخَيْرَ الْمَخْرَجِ",
          transcription: "Allahumma inni as'aluka khayral-mawliji wa khayral-makhraj",
          russianTranscription: "Аллахумма инни ас'алюка хайраль-маулиджи ва хайраль-махраж",
          translation: "О Аллах, я прошу Тебя о лучшем входе и лучшем выходе",
          reference: "Сахих Абу Дауд 5096",
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
          russianTranscription: "Аль-хамду лиллах",
          translation: "Хвала Аллаху",
          reference: "Коран 1:2",
          audioUrl: null,
        },
        {
          id: "general-2",
          arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
          transcription: "Subhanallahi wa bihamdih",
          russianTranscription: "Субханаллахи ва бихамдих",
          translation: "Свят Аллах и хвала Ему",
          reference: "Сахих Муслим 2691",
          audioUrl: null,
        },
        {
          id: "general-3",
          arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
          transcription: "La hawla wa la quwwata illa billah",
          russianTranscription: "Ля хауля ва ля куввата илля биллах",
          translation: "Нет силы и мощи ни у кого, кроме Аллаха",
          reference: "Сахих аль-Бухари 6610",
          audioUrl: null,
        },
        {
          id: "general-4",
          arabic: "رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ",
          transcription: "Rabbi ighfir li wa tub 'alayya",
          russianTranscription: "Рабби игфир ли ва туб 'аляййа",
          translation: "Господи, прости меня и прими моё покаяние",
          reference: "Сахих Ат-Тирмизи 3434",
          audioUrl: null,
        },
      ],
    },
  ];

  // Initialize: expand all categories if no search query
  useEffect(() => {
    if (!searchQuery) {
      setExpandedCategories(new Set(categories.map(cat => cat.id)));
    }
  }, [searchQuery]);

  const filteredCategories = categories.map(category => ({
    ...category,
    duas: category.duas.filter(dua =>
      dua.arabic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dua.transcription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dua.russianTranscription && dua.russianTranscription.toLowerCase().includes(searchQuery.toLowerCase())) ||
      dua.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.duas.length > 0);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const scrollToCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const element = categoryRefs.current[categoryId];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      // Expand category if collapsed
      if (!expandedCategories.has(categoryId)) {
        setExpandedCategories(prev => new Set(prev).add(categoryId));
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Search Bar */}
      <Card className="glass shadow-medium border-border/50">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Поиск по дуа, категориям..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50 border-border/50 focus:border-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Category Navigation */}
      {!searchQuery && (
        <Card className="glass shadow-medium border-border/50 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Категории</CardTitle>
            <CardDescription>Быстрый переход к категориям</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
              {categories.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategory === category.id;
                return (
                  <Button
                    key={category.id}
                    variant="ghost"
                    onClick={() => scrollToCategory(category.id)}
                    className={cn(
                      "shrink-0 flex flex-col items-center gap-2 h-auto py-3 px-4 rounded-xl transition-all duration-200",
                      "hover:bg-primary/10 hover:scale-105",
                      isSelected && "bg-primary/10 border-2 border-primary/30"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                      isSelected ? "bg-primary/20" : "bg-primary/10"
                    )}>
                      <Icon className={cn(
                        "w-5 h-5 transition-colors",
                        isSelected ? "text-primary" : "text-primary/70"
                      )} />
                    </div>
                    <span className={cn(
                      "text-xs font-medium text-center whitespace-nowrap",
                      isSelected ? "text-primary" : "text-foreground/70"
                    )}>
                      {category.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {category.duas.length}
                    </span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      {filteredCategories.length === 0 ? (
        <Card className="glass shadow-medium">
          <CardContent className="pt-6 text-center text-muted-foreground">
            Ничего не найдено. Попробуйте другой запрос.
          </CardContent>
        </Card>
      ) : (
        filteredCategories.map((category) => {
          const Icon = category.icon;
          const isExpanded = expandedCategories.has(category.id);
          const isSelected = selectedCategory === category.id;
          
          return (
            <div 
              key={category.id} 
              ref={(el) => { categoryRefs.current[category.id] = el; }}
              className={cn(
                "transition-all duration-300",
                isSelected && "ring-2 ring-primary/30 rounded-2xl p-1"
              )}
            >
              <Card className="glass shadow-medium border-border/50 overflow-hidden hover:shadow-strong transition-all duration-300">
                <div className="h-1 bg-gradient-to-r from-primary/50 to-transparent" />
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200",
                        isSelected ? "bg-primary/20 shadow-glow" : "bg-primary/10"
                      )}>
                        <Icon className={cn(
                          "w-6 h-6 transition-colors",
                          isSelected ? "text-primary" : "text-primary/80"
                        )} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl">{category.name}</CardTitle>
                        <CardDescription>
                          {category.duas.length} {category.duas.length === 1 ? "дуа" : "дуа"}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCategory(category.id);
                      }}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                
                {isExpanded && (
                  <CardContent className="pt-0 space-y-4 animate-in slide-in-from-top-2 duration-300">
                    {category.duas.map((dua) => (
                      <DuaCard key={dua.id} dua={dua} categoryColor={category.color} />
                    ))}
                  </CardContent>
                )}
              </Card>
            </div>
          );
        })
      )}
    </div>
  );
};
