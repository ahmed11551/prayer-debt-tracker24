import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Type, 
  Languages, 
  ChevronDown,
  Minus,
  Plus
} from "lucide-react";
import { useDuaSettings } from "@/hooks/useDuaSettings";
import { cn } from "@/lib/utils";

const TRANSLATION_LANGUAGES = [
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "kz", name: "Қазақша", flag: "🇰🇿" },
  { code: "kg", name: "Кыргызча", flag: "🇰🇬" },
  { code: "uz", name: "O'zbek", flag: "🇺🇿" },
  { code: "az", name: "Azərbaycan", flag: "🇦🇿" },
  { code: "tj", name: "Тоҷикӣ", flag: "🇹🇯" },
  { code: "tm", name: "Türkmen", flag: "🇹🇲" },
] as const;

export const DuaSettingsPanel = () => {
  const { settings, updateSettings, getArabicFontSizeClass } = useDuaSettings();
  const [fontSizeOpen, setFontSizeOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  const currentLanguage = TRANSLATION_LANGUAGES.find(lang => lang.code === settings.translationLanguage) || TRANSLATION_LANGUAGES[0];

  return (
    <div className="flex items-center gap-2">
      {/* Размер шрифта */}
      <Popover open={fontSizeOpen} onOpenChange={setFontSizeOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-white border border-gray-200 hover:bg-gray-50"
          >
            <Type className="h-5 w-5 text-amber-700" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Размер арабского шрифта
              </Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Маленький</span>
                  <span className="text-sm text-muted-foreground">Большой</span>
                </div>
                <Slider
                  value={[settings.arabicFontSize]}
                  onValueChange={([value]) => updateSettings({ arabicFontSize: value })}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateSettings({ arabicFontSize: Math.max(1, settings.arabicFontSize - 1) })}
                    disabled={settings.arabicFontSize <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-semibold w-12 text-center">
                    {settings.arabicFontSize}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateSettings({ arabicFontSize: Math.min(5, settings.arabicFontSize + 1) })}
                    disabled={settings.arabicFontSize >= 5}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-center">
                  <p className={cn("text-amber-700 font-arabic", getArabicFontSizeClass())} dir="rtl">
                    اللَّهُمَّ
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Пример текста</p>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Язык перевода */}
      <Popover open={languageOpen} onOpenChange={setLanguageOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-white border border-gray-200 hover:bg-gray-50"
          >
            <Languages className="h-5 w-5 text-amber-700" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Язык перевода
              </Label>
              <div className="space-y-2">
                {TRANSLATION_LANGUAGES.map((lang) => (
                  <Button
                    key={lang.code}
                    variant={settings.translationLanguage === lang.code ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      settings.translationLanguage === lang.code && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => {
                      updateSettings({ translationLanguage: lang.code });
                      setLanguageOpen(false);
                    }}
                  >
                    <span className="mr-2 text-lg">{lang.flag}</span>
                    <span>{lang.name}</span>
                    {settings.translationLanguage === lang.code && (
                      <span className="ml-auto">✓</span>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-transcription" className="text-sm font-medium">
                  Показать транскрипцию
                </Label>
                <Switch
                  id="show-transcription"
                  checked={settings.showTranscription}
                  onCheckedChange={(checked) => updateSettings({ showTranscription: checked })}
                />
              </div>
              {settings.showTranscription && (
                <div className="pl-4 space-y-2 border-l-2 border-primary/20">
                  <Label className="text-xs text-muted-foreground">Тип транскрипции:</Label>
                  <div className="space-y-1">
                    <Button
                      variant={settings.transcriptionType === "latin" ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start text-xs"
                      onClick={() => updateSettings({ transcriptionType: "latin" })}
                    >
                      Латиница
                    </Button>
                    <Button
                      variant={settings.transcriptionType === "cyrillic" ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start text-xs"
                      onClick={() => updateSettings({ transcriptionType: "cyrillic" })}
                    >
                      Кириллица
                    </Button>
                    <Button
                      variant={settings.transcriptionType === "both" ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start text-xs"
                      onClick={() => updateSettings({ transcriptionType: "both" })}
                    >
                      Оба варианта
                    </Button>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <Label htmlFor="show-translation" className="text-sm font-medium">
                  Показать перевод
                </Label>
                <Switch
                  id="show-translation"
                  checked={settings.showTranslation}
                  onCheckedChange={(checked) => updateSettings({ showTranslation: checked })}
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

