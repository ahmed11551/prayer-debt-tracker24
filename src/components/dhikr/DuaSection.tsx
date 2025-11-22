import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  Moon, 
  Sun, 
  Sunrise, 
  Sunset, 
  Plane, 
  Heart, 
  Utensils, 
  Car, 
  Home, 
  Star, 
  Share2,
  Search,
  ChevronRight
} from "lucide-react";
import { DuaCard } from "./DuaCard";
import { DuaSettingsPanel } from "./DuaSettingsPanel";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Иконка молящихся рук (замена, так как нет готовой иконки)
const PrayingHands = () => (
  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
    <span className="text-green-500 text-xl">🤲</span>
  </div>
);

interface DuaItem {
  id: string;
  arabic: string;
  transcription: string;
  russianTranscription?: string;
  translation: string;
  reference: string;
  audioUrl: string | null;
  title?: string; // Название подкатегории (например, "При ношении одежды")
}

interface DuaCategory {
  id: string;
  name: string;
  icon: any;
  count: number;
  description: string;
  duas: DuaItem[];
}

export const DuaSection = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"categories" | "favorites">("categories");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [todaysDua, setTodaysDua] = useState<DuaItem | null>(null);
  const [selectedDua, setSelectedDua] = useState<DuaItem | null>(null);
  const [isDuaDialogOpen, setIsDuaDialogOpen] = useState(false);

  // Обновленные категории с детальной категоризацией
  const categories: DuaCategory[] = [
    {
      id: "morning_evening",
      name: "Утро & вечер",
      icon: Sunrise,
      count: 6,
      description: "Дуа утром и вечером",
      duas: [
        {
          id: "morning-1",
          title: "Утреннее дуа",
          arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ",
          transcription: "Asbahna wa asbahal-mulku lillah",
          russianTranscription: "Асбахна ва асбахаль-мульку лиллах",
          translation: "Мы вступили в утро, и владычество принадлежит Аллаху",
          reference: "Сахих Муслим 2723",
          audioUrl: null,
        },
        {
          id: "morning-2",
          title: "Утреннее дуа (расширенное)",
          arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",
          transcription: "Allahumma bika asbahna wa bika amsayna wa bika nahya wa bika namutu wa ilaykan-nushur",
          russianTranscription: "Аллахумма бика асбахна ва бика амсайна ва бика нахья ва бика намуту ва иляйкан-нушур",
          translation: "О Аллах, с Тобой мы вступили в утро, с Тобой мы вступили в вечер, с Тобой мы живём, с Тобой мы умираем, и к Тебе воскрешение",
          reference: "Сахих Ат-Тирмизи 3391",
          audioUrl: null,
        },
        {
          id: "evening-1",
          title: "Вечернее дуа",
          arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ",
          transcription: "Amsayna wa amsal-mulku lillah",
          russianTranscription: "Амсайна ва амсаль-мульку лиллах",
          translation: "Мы вступили в вечер, и владычество принадлежит Аллаху",
          reference: "Сахих Муслим 2723",
          audioUrl: null,
        },
        {
          id: "evening-2",
          title: "Вечернее дуа (расширенное)",
          arabic: "اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ",
          transcription: "Allahumma bika amsayna wa bika asbahna wa bika nahya wa bika namutu wa ilaykal-masir",
          russianTranscription: "Аллахумма бика амсайна ва бика асбахна ва бика нахья ва бика намуту ва иляйкаль-масир",
          translation: "О Аллах, с Тобой мы вступили в вечер, с Тобой мы вступили в утро, с Тобой мы живём, с Тобой мы умираем, и к Тебе возвращение",
          reference: "Сахих Ат-Тирмизи 3391",
          audioUrl: null,
        },
        {
          id: "morning-3",
          title: "Утреннее дуа с Троном",
          arabic: "اللَّهُمَّ أَصْبَحْنَا نُشْهِدُكَ وَنُشْهِدُ حَمَلَةَ عَرْشِكَ",
          transcription: "Allahumma asbahna nushhiduka wa nushhidu hamalata 'arshik",
          russianTranscription: "Аллахумма асбахна нушихдука ва нушихду хамалята 'аршик",
          translation: "О Аллах, мы вступили в утро, свидетельствуя Тебя и свидетельствуя носителей Твоего Трона",
          reference: "Сахих Ат-Тирмизи 3392",
          audioUrl: null,
        },
        {
          id: "sleep-1",
          title: "Перед сном",
          arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
          transcription: "Bismika Allahumma amutu wa ahya",
          russianTranscription: "Бисмика Аллахумма амуту ва ахья",
          translation: "С именем Твоим, О Аллах, я умираю и оживаю",
          reference: "Сахих аль-Бухари 6314",
          audioUrl: null,
        },
      ],
    },
    {
      id: "home_family",
      name: "Дом & семья",
      icon: Home,
      count: 14,
      description: "Дуа для дома и семьи",
      duas: [
        {
          id: "home-1",
          title: "При входе в дом",
          arabic: "بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا",
          transcription: "Bismillahi walajna wa bismillahi kharajna",
          russianTranscription: "Бисмиллахи валяджна ва бисмиллахи хараджна",
          translation: "С именем Аллаха мы входим, и с именем Аллаха мы выходим",
          reference: "Сахих Абу Дауд 5096",
          audioUrl: null,
        },
        {
          id: "home-2",
          title: "При ношении одежды",
          arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلِجِ وَخَيْرَ الْمَخْرَجِ",
          transcription: "Allahumma inni as'aluka khayral-mawliji wa khayral-makhraji",
          russianTranscription: "Аллахумма инни ас'алюка хайраль-мавлиджи ва хайраль-махраджи",
          translation: "О Аллах, я прошу Тебя о лучшем входе и лучшем выходе",
          reference: "Сахих Муслим 2718",
          audioUrl: null,
        },
        {
          id: "home-3",
          title: "При ношении новой одежды",
          arabic: "اللَّهُمَّ لَكَ الْحَمْدُ أَنْتَ كَسَوْتَنِيهِ أَسْأَلُكَ خَيْرَهُ وَخَيْرَ مَا صُنِعَ لَهُ",
          transcription: "Allahumma laka al-hamdu anta kasawtanihi as'aluka khayrahu wa khayra ma suni'a lahu",
          russianTranscription: "Аллахумма ляка аль-хамду анта касавтанихи ас'алюка хайраху ва хайра ма суни'а ляху",
          translation: "О Аллах, хвала Тебе, Ты одел меня этим, прошу Тебя о благе этого и благе того, для чего это сделано",
          reference: "Сахих Ат-Тирмизи 1767",
          audioUrl: null,
        },
        {
          id: "home-4",
          title: "Кому-то в новой одежде",
          arabic: "تُبْلِي وَيُخْلِفُ اللَّهُ تَعَالَى",
          transcription: "Tubli wa yukhlifu Allahu ta'ala",
          russianTranscription: "Тубли ва юхлифу Аллаху та'аля",
          translation: "Носи до износа, и да заменит Аллах Всевышний",
          reference: "Сахих аль-Бухари 5822",
          audioUrl: null,
        },
        {
          id: "home-5",
          title: "Перед раздеванием",
          arabic: "بِسْمِ اللَّهِ",
          transcription: "Bismillah",
          russianTranscription: "Бисмиллах",
          translation: "С именем Аллаха",
          reference: "Сахих аль-Бухари 6320",
          audioUrl: null,
        },
        {
          id: "home-6",
          title: "Перед входом в туалет",
          arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ",
          transcription: "Allahumma inni a'udhu bika minal-khubuthi wal-khaba'ith",
          russianTranscription: "Аллахумма инни а'узу бика миналь-хубуси валь-хаба'ис",
          translation: "О Аллах, я прибегаю к Тебе от зла и злых духов",
          reference: "Сахих аль-Бухари 142",
          audioUrl: null,
        },
        {
          id: "home-7",
          title: "После выхода из туалета",
          arabic: "غُفْرَانَكَ",
          transcription: "Ghufranak",
          russianTranscription: "Гуфранак",
          translation: "Прошу у Тебя прощения",
          reference: "Сахих Абу Дауд 30",
          audioUrl: null,
        },
        {
          id: "home-8",
          title: "При выходе из дома",
          arabic: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
          transcription: "Bismillahi tawakkaltu 'ala Allahi wa la hawla wa la quwwata illa billah",
          russianTranscription: "Бисмиллахи таваккальту 'аля Аллахи ва ля хауля ва ля куввата илля биллях",
          translation: "С именем Аллаха, я уповаю на Аллаха, и нет силы и мощи ни у кого, кроме Аллаха",
          reference: "Сахих Ат-Тирмизи 3426",
          audioUrl: null,
        },
        {
          id: "home-9",
          title: "При входе в дом",
          arabic: "بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا",
          transcription: "Bismillahi walajna wa bismillahi kharajna",
          russianTranscription: "Бисмиллахи валяджна ва бисмиллахи хараджна",
          translation: "С именем Аллаха мы входим, и с именем Аллаха мы выходим",
          reference: "Сахих Абу Дауд 5096",
          audioUrl: null,
        },
        {
          id: "home-10",
          title: "Для благословения семьи",
          arabic: "اللَّهُمَّ بَارِكْ لِي فِي أَهْلِي وَمَالِي",
          transcription: "Allahumma barik li fi ahli wa mali",
          russianTranscription: "Аллахумма барик ли фи ахли ва мали",
          translation: "О Аллах, благослови меня в моей семье и моем имуществе",
          reference: "Сахих Муслим 2725",
          audioUrl: null,
        },
        {
          id: "home-11",
          title: "Для супругов и детей",
          arabic: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ",
          transcription: "Rabbana hab lana min azwajina wa dhurriyyatina qurrata a'yun",
          russianTranscription: "Раббана хаб ляна мин азваджина ва зуррийятина куррата а'юн",
          translation: "Господь наш, даруй нам отраду глаз в наших супругах и потомках",
          reference: "Коран 25:74",
          audioUrl: null,
        },
        {
          id: "home-12",
          title: "От искушения",
          arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ فِتْنَةِ النَّارِ",
          transcription: "Allahumma inni a'udhu bika min fitnatin-nar",
          russianTranscription: "Аллахумма инни а'узу бика мин фитнатин-нар",
          translation: "О Аллах, я прибегаю к Тебе от искушения Огня",
          reference: "Сахих Муслим 2717",
          audioUrl: null,
        },
        {
          id: "home-13",
          title: "При виде новорожденного",
          arabic: "أُعِيذُهَا بِكَ وَذُرِّيَّتَهَا مِنَ الشَّيْطَانِ الرَّجِيمِ",
          transcription: "U'idhuha bika wa dhurriyyataha minash-shaytanir-rajim",
          russianTranscription: "У'изуха бика ва зуррийятаха минаш-шайтанир-раджим",
          translation: "Прибегаю к Тебе за защитой для нее и ее потомства от шайтана изгнанного",
          reference: "Сахих аль-Бухари 3371",
          audioUrl: null,
        },
        {
          id: "home-14",
          title: "При виде зеркала",
          arabic: "اللَّهُمَّ أَحْسَنْتَ خَلْقِي فَحَسِّنْ خُلُقِي",
          transcription: "Allahumma ahsanta khalqi fa hassin khuluqi",
          russianTranscription: "Аллахумма ахсанта хальки фа хассин хулюки",
          translation: "О Аллах, Ты создал меня красивым, сделай и мой нрав красивым",
          reference: "Сахих Ибн Маджа 4147",
          audioUrl: null,
        },
      ],
    },
    {
      id: "food_drink",
      name: "Еда & напиток",
      icon: Utensils,
      count: 7,
      description: "Дуа перед и после еды",
      duas: [
        {
          id: "food-1",
          title: "Перед едой",
          arabic: "بِسْمِ اللَّهِ",
          transcription: "Bismillah",
          russianTranscription: "Бисмиллах",
          translation: "С именем Аллаха",
          reference: "Сахих аль-Бухари 5376",
          audioUrl: null,
        },
        {
          id: "food-2",
          title: "После еды",
          arabic: "اللَّهُمَّ بَارِكْ لَنَا فِيهِ وَأَطْعِمْنَا خَيْرًا مِنْهُ",
          transcription: "Allahumma barik lana fihi wa at'imna khayran minhu",
          russianTranscription: "Аллахумма барик ляна фихи ва ат'имна хайран минху",
          translation: "О Аллах, благослови нас в этом и накорми нас лучшим, чем это",
          reference: "Сахих Ат-Тирмизи 3458",
          audioUrl: null,
        },
        {
          id: "food-3",
          title: "Благодарность за еду",
          arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ",
          transcription: "Alhamdulillahil-ladhi at'amana wa saqana wa ja'alana muslimin",
          russianTranscription: "Альхамдулиллахиль-лязи ат'амана ва сакана ва джа'аляна муслимин",
          translation: "Хвала Аллаху, Который накормил нас, напоил нас и сделал нас мусульманами",
          reference: "Сахих Ат-Тирмизи 3457",
          audioUrl: null,
        },
        {
          id: "food-4",
          title: "При увеличении еды",
          arabic: "اللَّهُمَّ بَارِكْ لَنَا فِيهِ وَزِدْنَا مِنْهُ",
          transcription: "Allahumma barik lana fihi wa zidna minhu",
          russianTranscription: "Аллахумма барик ляна фихи ва зидна минху",
          translation: "О Аллах, благослови нас в этом и увеличь нам от этого",
          reference: "Сахих аль-Бухари 5379",
          audioUrl: null,
        },
        {
          id: "food-5",
          title: "Для того, кто накормил",
          arabic: "اللَّهُمَّ أَطْعِمْ مَنْ أَطْعَمَنِي",
          transcription: "Allahumma at'im man at'amani",
          russianTranscription: "Аллахумма ат'им ман ат'амани",
          translation: "О Аллах, накорми того, кто накормил меня",
          reference: "Сахих Муслим 2055",
          audioUrl: null,
        },
        {
          id: "food-6",
          title: "Благословение удела",
          arabic: "اللَّهُمَّ بَارِكْ لَنَا فِي رُزْقِنَا",
          transcription: "Allahumma barik lana fi rizqina",
          russianTranscription: "Аллахумма барик ляна фи ризкина",
          translation: "О Аллах, благослови нас в нашем уделах",
          reference: "Общее",
          audioUrl: null,
        },
        {
          id: "food-7",
          title: "От тягот",
          arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ جَهْدِ الْبَلَاءِ",
          transcription: "Allahumma inni a'udhu bika min jahdil-bala",
          russianTranscription: "Аллахумма инни а'узу бика мин джахдиль-баля",
          translation: "О Аллах, я прибегаю к Тебе от тягот испытания",
          reference: "Общее",
          audioUrl: null,
        },
      ],
    },
    {
      id: "joy_sorrow",
      name: "Радость & печаль",
      icon: Heart,
      count: 15,
      description: "Дуа в радости и печали",
      duas: [
        {
          id: "general-1",
          title: "Дуа Раббана",
          arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
          transcription: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaban-nar",
          russianTranscription: "Раббана атина фид-дунья хасанатан ва филь-ахирати хасанатан ва кина 'азабан-нар",
          translation: "Господь наш, даруй нам в этом мире благо и в Последней жизни благо, и защити нас от наказания Огня",
          reference: "Коран 2:201",
          audioUrl: null,
        },
        {
          id: "general-2",
          title: "От печали и горя",
          arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحُزْنِ",
          transcription: "Allahumma inni a'udhu bika minal-hammi wal-huzn",
          russianTranscription: "Аллахумма инни а'узу бика миналь-хамми валь-хузн",
          translation: "О Аллах, я прибегаю к Тебе от печали и горя",
          reference: "Сахих аль-Бухари 6369",
          audioUrl: null,
        },
        {
          id: "general-3",
          title: "От слабости и лени",
          arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ",
          transcription: "Allahumma inni a'udhu bika minal-'ajzi wal-kasal",
          russianTranscription: "Аллахумма инни а'узу бика миналь-'аджи валь-касаль",
          translation: "О Аллах, я прибегаю к Тебе от слабости и лени",
          reference: "Сахих Муслим 2706",
          audioUrl: null,
        },
        {
          id: "general-4",
          title: "От трусости и скупости",
          arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْجُبْنِ وَالْبُخْلِ",
          transcription: "Allahumma inni a'udhu bika minal-jubni wal-bukhl",
          russianTranscription: "Аллахумма инни а'узу бика миналь-джубни валь-бухль",
          translation: "О Аллах, я прибегаю к Тебе от трусости и скупости",
          reference: "Сахих Муслим 2706",
          audioUrl: null,
        },
        {
          id: "general-5",
          title: "От наказания могилы",
          arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ",
          transcription: "Allahumma inni a'udhu bika min 'adhabil-qabr",
          russianTranscription: "Аллахумма инни а'узу бика мин 'азабиль-кабр",
          translation: "О Аллах, я прибегаю к Тебе от наказания могилы",
          reference: "Сахих Муслим 2710",
          audioUrl: null,
        },
        ...Array.from({ length: 10 }, (_, i) => ({
          id: `joy-sorrow-${i + 6}`,
          title: `Дуа ${i + 6}`,
          arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ",
          transcription: "Allahumma inni a'udhu bika",
          russianTranscription: "Аллахумма инни а'узу бика",
          translation: "О Аллах, я прибегаю к Тебе",
          reference: "Общее",
          audioUrl: null,
        })),
      ],
    },
    {
      id: "travel",
      name: "Путешествовать",
      icon: Plane,
      count: 2,
      description: "Дуа в пути",
      duas: [
        {
          id: "travel-1",
          title: "При посадке в транспорт",
          arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَىٰ رَبِّنَا لَمُنقَلِبُونَ",
          transcription: "Subhanalladhi sakhkhara lana hadha wa ma kunna lahu muqrinin wa inna ila rabbina lamunqalibun",
          russianTranscription: "Субханаллязи саххара ляна хаза ва ма кунна ляху мукринин ва инна иля раббина лямункалибун",
          translation: "Свят Тот, Кто подчинил нам это, а мы не были способны на это сами, и, поистине, мы возвращаемся к нашему Господу",
          reference: "Коран 43:13",
          audioUrl: null,
        },
        {
          id: "travel-2",
          title: "В путешествии",
          arabic: "اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَٰذَا الْبِرَّ وَالتَّقْوَىٰ",
          transcription: "Allahumma inni nas'aluka fi safarina hadhal-birra wat-taqwa",
          russianTranscription: "Аллахумма инна нас'алюка фи сафарина хазаль-бирра ват-таква",
          translation: "О Аллах, мы просим Тебя о благочестии и богобоязненности в этом нашем путешествии",
          reference: "Сахих Муслим 1342",
          audioUrl: null,
        },
      ],
    },
  ];

  // Получаем избранные дуа
  const [bookmarksUpdated, setBookmarksUpdated] = useState(0);
  
  const favorites = useMemo(() => {
    try {
      const bookmarks = localStorage.getItem("prayer_debt_bookmarks");
      if (bookmarks) {
        const parsed = JSON.parse(bookmarks);
        if (Array.isArray(parsed)) {
          return new Set(parsed.map((b: { id: string }) => b.id));
        }
      }
    } catch (error) {
      console.error("Error reading favorites:", error);
    }
    return new Set<string>();
  }, [bookmarksUpdated]);

  // Слушаем обновления закладок
  useEffect(() => {
    const handleStorageChange = () => {
      setBookmarksUpdated(prev => prev + 1);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('bookmarksUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('bookmarksUpdated', handleStorageChange);
    };
  }, []);

  // Получаем сегодняшнее дуа (случайное из всех категорий)
  useEffect(() => {
    const allDuas = categories.flatMap(cat => cat.duas);
    if (allDuas.length > 0) {
      const today = new Date();
      const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
      const index = dayOfYear % allDuas.length;
      setTodaysDua(allDuas[index]);
    }
  }, []);

  // Быстрый поиск по всем дуа (индексированный)
  const allDuasFlat = useMemo(() => {
    return categories.flatMap(cat => 
      cat.duas.map(dua => ({ ...dua, categoryId: cat.id, categoryName: cat.name }))
    );
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase().trim();
    return allDuasFlat.filter(dua => {
      const searchFields = [
        dua.title?.toLowerCase() || "",
        dua.arabic.toLowerCase(),
        dua.transcription.toLowerCase(),
        dua.russianTranscription?.toLowerCase() || "",
        dua.translation.toLowerCase(),
        dua.reference.toLowerCase(),
        dua.categoryName.toLowerCase(),
      ];
      
      return searchFields.some(field => field.includes(query));
    });
  }, [searchQuery, allDuasFlat]);

  // Получаем все избранные дуа
  const favoriteDuas = useMemo(() => {
    return allDuasFlat.filter(dua => favorites.has(dua.id));
  }, [favorites, allDuasFlat]);

  // Обработка добавления в избранное для сегодняшнего дуа
  const handleToggleFavorite = (dua: DuaItem) => {
    try {
      const bookmarks = localStorage.getItem("prayer_debt_bookmarks");
      let bookmarksArray: any[] = [];
      
      if (bookmarks) {
        bookmarksArray = JSON.parse(bookmarks);
      }
      
      const existingIndex = bookmarksArray.findIndex((b: any) => b.id === dua.id);
      
      if (existingIndex >= 0) {
        bookmarksArray.splice(existingIndex, 1);
        toast({
          title: "Удалено из избранного",
          description: "Дуа удалено из вашего списка избранного",
        });
      } else {
        bookmarksArray.push({
          id: dua.id,
          arabic: dua.arabic,
          transcription: dua.transcription,
          translation: dua.translation,
          reference: dua.reference,
        });
        toast({
          title: "Добавлено в избранное",
          description: "Дуа добавлено в ваш список избранного",
        });
      }
      
      localStorage.setItem("prayer_debt_bookmarks", JSON.stringify(bookmarksArray));
      window.dispatchEvent(new CustomEvent('bookmarksUpdated'));
      setBookmarksUpdated(prev => prev + 1);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить избранное",
        variant: "destructive",
      });
    }
  };

  // Обработка шаринга
  const handleShare = (dua: DuaItem) => {
    const text = `${dua.arabic}\n\n${dua.transcription}\n\n${dua.translation}\n\n${dua.reference}`;
    
    if (navigator.share) {
      navigator.share({
        title: dua.title || "Дуа",
        text: text,
      }).catch(() => {
        // Fallback to copy
        navigator.clipboard.writeText(text);
        toast({
          title: "Скопировано",
          description: "Дуа скопировано в буфер обмена",
        });
      });
    } else {
      navigator.clipboard.writeText(text);
      toast({
        title: "Скопировано",
        description: "Дуа скопировано в буфер обмена",
      });
    }
  };

  const isTodaysDuaFavorite = todaysDua ? favorites.has(todaysDua.id) : false;
  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Поиск и настройки (всегда видимые для быстрого доступа) */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Поиск по дуа (название, текст, перевод)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 focus:border-primary focus:ring-primary"
              />
            </div>
            <DuaSettingsPanel />
          </div>
        </CardContent>
      </Card>

      {/* Результаты поиска */}
      {searchQuery.trim() && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">
              Найдено: {searchResults.length}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
            >
              Очистить
            </Button>
          </div>
          {searchResults.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <p className="text-lg font-semibold mb-2">Ничего не найдено</p>
                <p className="text-sm text-muted-foreground">
                  Попробуйте другой запрос
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {searchResults.map((dua) => (
                <Card
                  key={dua.id}
                  className="cursor-pointer transition-all hover:shadow-md bg-white border border-gray-200 rounded-lg"
                  onClick={() => {
                    setSelectedDua(dua);
                    setIsDuaDialogOpen(true);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base text-gray-900 mb-1">
                          {dua.title || "Дуа"}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {dua.translation}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {dua.categoryName}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Основной контент (если нет поиска) */}
      {!searchQuery.trim() && (
        <>
          {/* Табы */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "categories" | "favorites")}>
            <TabsList className="w-full grid grid-cols-2 bg-transparent h-auto p-0 gap-0">
              <TabsTrigger 
                value="categories" 
                className={cn(
                  "rounded-none border-b-2 border-transparent data-[state=active]:border-green-500",
                  "data-[state=active]:text-green-500 data-[state=active]:bg-transparent",
                  "data-[state=inactive]:text-gray-500",
                  "px-4 py-2 font-medium"
                )}
              >
                Категории
              </TabsTrigger>
              <TabsTrigger 
                value="favorites"
                className={cn(
                  "rounded-none border-b-2 border-transparent data-[state=active]:border-green-500",
                  "data-[state=active]:text-green-500 data-[state=active]:bg-transparent",
                  "data-[state=inactive]:text-gray-500",
                  "px-4 py-2 font-medium"
                )}
              >
                Любимое
              </TabsTrigger>
            </TabsList>

            <TabsContent value="categories" className="space-y-6 mt-6">
              {/* Сегодняшний Dua */}
              {todaysDua && (
                <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <PrayingHands />
                      <h3 className="font-semibold text-lg text-gray-900">Сегодняшний Dua</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-sm text-gray-800 leading-relaxed">
                        I seek refuge in Allah from satan the outcast (then you should desist from doing what you are in doubt... A 'oothu billaahi minash-Shaytaanir-rajeem.
                      </p>
                      {todaysDua.transcription && (
                        <p className="text-sm text-gray-600 italic">
                          {todaysDua.transcription}
                        </p>
                      )}
                      {todaysDua.translation && (
                        <p className="text-sm text-gray-500">
                          {todaysDua.translation}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-6 pt-3 border-t border-gray-200">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleFavorite(todaysDua)}
                        className={cn(
                          "flex items-center gap-2 px-0 hover:bg-transparent",
                          isTodaysDuaFavorite && "text-yellow-500"
                        )}
                      >
                        <Star className={cn("w-4 h-4", isTodaysDuaFavorite && "fill-current")} />
                        <span className="text-sm">Любимое</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(todaysDua)}
                        className="flex items-center gap-2 px-0 hover:bg-transparent"
                      >
                        <Share2 className="w-4 h-4" />
                        <span className="text-sm">Поделиться</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Список категорий или детальный список внутри категории */}
              {!selectedCategory ? (
                <div className="space-y-3">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    
                    return (
                      <Card
                        key={category.id}
                        className="cursor-pointer transition-all hover:shadow-md bg-white border border-gray-200 rounded-xl"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                                <Icon className="w-7 h-7 text-primary" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg text-gray-900">{category.name}</h3>
                                {category.description && (
                                  <p className="text-sm text-gray-500 mt-0.5">{category.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-gray-100 text-gray-700 font-semibold min-w-[32px] justify-center">
                                {category.count}
                              </Badge>
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Заголовок категории с кнопкой назад */}
                  <div className="flex items-center gap-4 mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCategory(null)}
                      className="flex items-center gap-2"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                      Назад
                    </Button>
                    <div className="flex-1">
                      <h2 className="font-bold text-xl">{selectedCategoryData?.name}</h2>
                      <p className="text-sm text-gray-500">Всего: {selectedCategoryData?.count}</p>
                    </div>
                  </div>

                  {/* Детальный список дуа в категории (как на скриншоте) */}
                  <div className="space-y-2">
                    {selectedCategoryData?.duas.map((dua, index) => (
                      <Card
                        key={dua.id}
                        className="cursor-pointer transition-all hover:shadow-md bg-white border border-gray-200 rounded-lg"
                        onClick={() => {
                          setSelectedDua(dua);
                          setIsDuaDialogOpen(true);
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-base text-gray-900">
                                  {dua.title || `Дуа ${index + 1}`}
                                </h3>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4 mt-6">
              {favoriteDuas.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center py-12">
                    <Star className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-lg font-semibold mb-2">Нет избранных дуа</p>
                    <p className="text-sm text-muted-foreground">
                      Добавьте дуа в избранное, нажав на звездочку
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {favoriteDuas.map((dua) => (
                    <DuaCard key={dua.id} dua={dua} categoryColor="category-general" />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Модальное окно с детальной карточкой дуа */}
      <Dialog open={isDuaDialogOpen} onOpenChange={setIsDuaDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedDua && (
            <DuaCard dua={selectedDua} categoryColor="category-general" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
