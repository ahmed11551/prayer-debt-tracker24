// Компонент для поделиться и доступа друзьям (соревновательный эффект)

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Users, Trophy, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: Date;
}

interface Friend {
  id: string;
  name: string;
  progress: number;
  avatar?: string;
}

export const ShareAndFriends = () => {
  const { toast } = useToast();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [friendsDialogOpen, setFriendsDialogOpen] = useState(false);
  const [friendCode, setFriendCode] = useState("");

  // Mock данные достижений
  const achievements: Achievement[] = [
    {
      id: "first-100",
      title: "Первые 100",
      description: "Восполнено 100 намазов",
      icon: "✨",
      unlocked: true,
      unlockedDate: new Date("2024-01-20"),
    },
    {
      id: "week-streak",
      title: "7 дней подряд",
      description: "Восполнение намазов 7 дней подряд",
      icon: "🔥",
      unlocked: true,
      unlockedDate: new Date("2024-02-01"),
    },
    {
      id: "thousand",
      title: "1000 намазов",
      description: "Восполнено 1000 намазов",
      icon: "🌟",
      unlocked: false,
    },
    {
      id: "halfway",
      title: "50% пути",
      description: "Пройдена половина пути",
      icon: "🎯",
      unlocked: false,
    },
  ];

  // Mock данные друзей
  const friends: Friend[] = [
    { id: "1", name: "Ахмад", progress: 75 },
    { id: "2", name: "Марьям", progress: 68 },
    { id: "3", name: "Юсуф", progress: 82 },
  ];

  const handleShare = async (achievementId?: string) => {
    try {
      const shareData: ShareData = {
        title: achievementId
          ? `Я получил достижение "${achievements.find((a) => a.id === achievementId)?.title}"!`
          : "Мой прогресс в восполнении намазов",
        text: achievementId
          ? achievements.find((a) => a.id === achievementId)?.description
          : "Посмотрите мой прогресс в восполнении пропущенных намазов",
        url: window.location.href,
      };

      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: "Успешно поделились",
          description: "Ваш прогресс был отправлен",
        });
      } else {
        // Fallback: копирование в буфер обмена
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Ссылка скопирована",
          description: "Ссылка на ваш прогресс скопирована в буфер обмена",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось поделиться",
        variant: "destructive",
      });
    }
    setShareDialogOpen(false);
  };

  const handleAddFriend = () => {
    if (!friendCode.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите код друга",
        variant: "destructive",
      });
      return;
    }

    // В реальном приложении здесь будет запрос к API
    toast({
      title: "Друг добавлен",
      description: "Теперь вы можете видеть прогресс друг друга",
    });
    setFriendCode("");
    setFriendsDialogOpen(false);
  };

  const overallProgress = 70; // Mock данные

  return (
    <div className="space-y-6">
      {/* Achievements Card */}
      <Card className="bg-gradient-card shadow-medium border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              <CardTitle>Достижения</CardTitle>
            </div>
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Поделиться
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Поделиться достижениями</DialogTitle>
                  <DialogDescription>
                    Выберите достижение для публикации или поделитесь общим прогрессом
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-4">
                  <Button
                    onClick={() => handleShare()}
                    className="w-full"
                    variant="outline"
                  >
                    Поделиться общим прогрессом
                  </Button>
                  {achievements
                    .filter((a) => a.unlocked)
                    .map((achievement) => (
                      <Button
                        key={achievement.id}
                        onClick={() => handleShare(achievement.id)}
                        className="w-full"
                        variant="outline"
                      >
                        <span className="mr-2">{achievement.icon}</span>
                        {achievement.title}
                      </Button>
                    ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>Ваши достижения в восполнении намазов</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`text-center p-4 rounded-lg border transition-all ${
                  achievement.unlocked
                    ? "bg-gradient-primary/10 border-primary/50 shadow-glow"
                    : "bg-card opacity-50 border-border"
                }`}
              >
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <div className="text-sm font-semibold">{achievement.title}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {achievement.description}
                </div>
                {achievement.unlocked && achievement.unlockedDate && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {new Date(achievement.unlockedDate).toLocaleDateString("ru-RU")}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Friends Leaderboard */}
      <Card className="bg-gradient-card shadow-medium border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <CardTitle>Друзья</CardTitle>
            </div>
            <Dialog open={friendsDialogOpen} onOpenChange={setFriendsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Users className="w-4 h-4 mr-2" />
                  Добавить друга
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить друга</DialogTitle>
                  <DialogDescription>
                    Введите код друга, чтобы видеть его прогресс и соревноваться
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="friendCode">Код друга</Label>
                    <Input
                      id="friendCode"
                      placeholder="Введите код друга"
                      value={friendCode}
                      onChange={(e) => setFriendCode(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setFriendsDialogOpen(false)}
                      className="flex-1"
                    >
                      Отмена
                    </Button>
                    <Button onClick={handleAddFriend} className="flex-1 bg-gradient-primary">
                      Добавить
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>Соревнуйтесь с друзьями в восполнении намазов</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Your Progress */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-primary/10 border border-primary/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                  Вы
                </div>
                <div>
                  <div className="font-semibold">Ваш прогресс</div>
                  <div className="text-sm text-muted-foreground">{overallProgress}% выполнено</div>
                </div>
              </div>
              <Badge variant="default" className="bg-gradient-primary">
                {overallProgress}%
              </Badge>
            </div>

            {/* Friends List */}
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border/50 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary/20 flex items-center justify-center text-primary font-bold">
                    {friend.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold">{friend.name}</div>
                    <div className="text-sm text-muted-foreground">{friend.progress}% выполнено</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {friend.progress > overallProgress ? (
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  ) : null}
                  <Badge variant="outline">{friend.progress}%</Badge>
                </div>
              </div>
            ))}

            {friends.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Добавьте друзей, чтобы соревноваться
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

