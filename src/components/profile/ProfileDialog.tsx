// Диалог профиля с настройками

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Crown,
  Settings,
  Bell,
  Moon,
  Sun,
  Globe,
  Vibrate,
  Info,
  Shield,
  HelpCircle,
  LogOut,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getTelegramUser } from "@/lib/telegram";
import { DataBackupDialog } from "@/components/qaza/DataBackupDialog";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProfileDialog = ({ open, onOpenChange }: ProfileDialogProps) => {
  const { toast } = useToast();
  const [userLevel, setUserLevel] = useState<"free" | "pro" | "premium">("free");
  const [settings, setSettings] = useState({
    theme: "dark" as "light" | "dark" | "auto",
    notifications: true,
    vibration: true,
    language: "ru",
  });

  // Получаем данные пользователя из Telegram
  const telegramUser = getTelegramUser();

  useEffect(() => {
    // Загружаем настройки из localStorage
    const saved = localStorage.getItem("user_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings((prev) => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    }

    // Определяем уровень пользователя
    const isPremium = localStorage.getItem("user_premium") === "true";
    const isPro = localStorage.getItem("user_pro") === "true";
    setUserLevel(isPremium ? "premium" : isPro ? "pro" : "free");
  }, []);

  const saveSettings = (newSettings: Partial<typeof settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem("user_settings", JSON.stringify(updated));
    toast({
      title: "Настройки сохранены",
      description: "Изменения применены",
    });
  };

  const handleUpgrade = () => {
    toast({
      title: "Переход на Premium",
      description: "Функция будет реализована в следующем обновлении",
    });
  };

  const handleLogout = () => {
    // Очистка данных (опционально)
    toast({
      title: "Выход",
      description: "Функция выхода будет реализована",
    });
  };

  const getLevelLabel = () => {
    switch (userLevel) {
      case "premium":
        return "Сахиб аль-Вакуф";
      case "pro":
        return "Мутахсин";
      default:
        return "Муслим";
    }
  };

  const getLevelColor = () => {
    switch (userLevel) {
      case "premium":
        return "bg-gradient-to-r from-purple-500 to-pink-500";
      case "pro":
        return "bg-gradient-to-r from-blue-500 to-cyan-500";
      default:
        return "bg-gradient-to-r from-accent to-accent-light";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-mosque">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <User className="w-6 h-6 text-accent" />
            Профиль
          </DialogTitle>
          <DialogDescription>
            Управление настройками и подпиской
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Информация о пользователе */}
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-3xl font-bold text-primary shadow-glow-gold">
                    {telegramUser?.first_name?.[0] || "U"}
                  </div>
                  {userLevel !== "free" && (
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                      <Crown className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">
                    {telegramUser?.first_name || "Пользователь"} {telegramUser?.last_name || ""}
                  </h3>
                  <Badge className={cn("mt-2", getLevelColor(), "text-white border-0")}>
                    <Sparkles className="w-3 h-3 mr-1" />
                    {getLevelLabel()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Прогресс развития */}
          {userLevel === "free" && (
            <Card className="bg-gradient-card border-accent/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  Развитие
                </CardTitle>
                <CardDescription>
                  Перейдите на PRO для расширенных возможностей
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Текущий уровень</span>
                    <span className="font-semibold">Муслим (Free)</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent to-accent-light transition-all duration-500"
                      style={{ width: "30%" }}
                    />
                  </div>
                  <Button
                    onClick={handleUpgrade}
                    className="w-full bg-gradient-to-r from-accent to-accent-light text-primary font-semibold hover:opacity-90"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Перейти на Premium
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Настройки */}
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-accent" />
                Настройки
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Тема */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="theme" className="text-base">Тема</Label>
                    <p className="text-sm text-muted-foreground">Выберите цветовую схему</p>
                  </div>
                </div>
                <Select
                  value={settings.theme}
                  onValueChange={(value) => saveSettings({ theme: value as typeof settings.theme })}
                >
                  <SelectTrigger id="theme" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4" />
                        Светлая
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4" />
                        Темная
                      </div>
                    </SelectItem>
                    <SelectItem value="auto">
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Авто
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Уведомления */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="notifications" className="text-base">Уведомления</Label>
                    <p className="text-sm text-muted-foreground">Получать напоминания о намазах</p>
                  </div>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked) => saveSettings({ notifications: checked })}
                />
              </div>

              <Separator />

              {/* Вибрация */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Vibrate className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="vibration" className="text-base">Вибрация</Label>
                    <p className="text-sm text-muted-foreground">Тактильная обратная связь</p>
                  </div>
                </div>
                <Switch
                  id="vibration"
                  checked={settings.vibration}
                  onCheckedChange={(checked) => saveSettings({ vibration: checked })}
                />
              </div>

              <Separator />

              {/* Язык */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="language" className="text-base">Язык</Label>
                    <p className="text-sm text-muted-foreground">Язык интерфейса</p>
                  </div>
                </div>
                <Select
                  value={settings.language}
                  onValueChange={(value) => saveSettings({ language: value })}
                >
                  <SelectTrigger id="language" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ru">Русский</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Резервное копирование */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <Label className="text-base">Резервная копия</Label>
                    <p className="text-sm text-muted-foreground">Экспорт и импорт данных</p>
                  </div>
                </div>
                <DataBackupDialog />
              </div>
            </CardContent>
          </Card>

          {/* О приложении */}
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="w-5 h-5 text-accent" />
                О приложении
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Версия</span>
                <span className="font-semibold">1.0.0</span>
              </div>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <a href="/privacy" target="_blank" rel="noopener noreferrer">
                  <Shield className="w-4 h-4 mr-2" />
                  Политика конфиденциальности
                </a>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <a href="/support" target="_blank" rel="noopener noreferrer">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Поддержка
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Выход */}
          <Button
            variant="outline"
            className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Выход
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

