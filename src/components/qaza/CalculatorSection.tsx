import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Calculator, Calendar, User, Plane } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const CalculatorSection = () => {
  const { toast } = useToast();
  const [gender, setGender] = useState<"male" | "female">("male");
  const [useTodayAsStart, setUseTodayAsStart] = useState(true);

  const handleCalculate = () => {
    toast({
      title: "Расчёт выполнен",
      description: "Ваш долг пропущенных намазов рассчитан.",
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Introduction Card */}
      <Card className="bg-gradient-card shadow-medium border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            <CardTitle>Калькулятор пропущенных намазов</CardTitle>
          </div>
          <CardDescription>
            Рассчитайте количество пропущенных обязательных намазов с момента совершеннолетия (булюг)
            по ханафитскому мазхабу
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Personal Data */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <User className="w-4 h-4" />
              <span>Личные данные</span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="birthDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Дата рождения
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label>Пол</Label>
                <RadioGroup
                  value={gender}
                  onValueChange={(value) => setGender(value as "male" | "female")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male" className="cursor-pointer">Мужской</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female" className="cursor-pointer">Женский</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulughAge">Возраст булюга (лет)</Label>
                <Input
                  id="bulughAge"
                  type="number"
                  defaultValue={15}
                  min={12}
                  max={18}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prayerStartDate">Дата начала молитв</Label>
                <Input
                  id="prayerStartDate"
                  type="date"
                  disabled={useTodayAsStart}
                  className="bg-background"
                />
                <div className="flex items-center space-x-2 mt-2">
                  <Switch
                    id="useToday"
                    checked={useTodayAsStart}
                    onCheckedChange={setUseTodayAsStart}
                  />
                  <Label htmlFor="useToday" className="text-sm cursor-pointer">
                    С сегодняшнего дня
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Women's Data */}
          {gender === "female" && (
            <div className="space-y-4 p-4 rounded-lg bg-secondary/50 border border-border">
              <div className="text-sm font-medium text-primary">
                Данные для женщин
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="haidDays">Дней хайда в месяц</Label>
                  <Input
                    id="haidDays"
                    type="number"
                    defaultValue={7}
                    min={1}
                    max={15}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="childbirthCount">Количество родов</Label>
                  <Input
                    id="childbirthCount"
                    type="number"
                    defaultValue={0}
                    min={0}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nifasDays">Дней нифаса за роды</Label>
                  <Input
                    id="nifasDays"
                    type="number"
                    defaultValue={40}
                    min={1}
                    max={40}
                    className="bg-background"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Travel Data */}
          <div className="space-y-4 p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Plane className="w-4 h-4" />
              <span>Дни в пути (сафар)</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="travelDays">Общее количество дней в путешествиях</Label>
              <Input
                id="travelDays"
                type="number"
                defaultValue={0}
                min={0}
                placeholder="Введите приблизительное количество дней"
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">
                Укажите приблизительное количество дней, проведенных в путешествиях (сафар),
                где вы сокращали намазы
              </p>
            </div>
          </div>

          {/* Calculate Button */}
          <Button
            onClick={handleCalculate}
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow"
            size="lg"
          >
            <Calculator className="w-5 h-5 mr-2" />
            Рассчитать долг намазов
          </Button>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-accent/30 bg-accent/5">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong className="text-accent">Примечание:</strong> Расчёт выполняется по методике
            ханафитского мазхаба. Витр включён в обязательные намазы. Для женщин учитываются
            периоды хайда и нифаса. В дни сафара учитывается сокращение четырёхракаатных намазов.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
