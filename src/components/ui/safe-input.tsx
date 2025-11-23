import * as React from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import { validateTextField, validatePositiveInteger } from "@/lib/validation";
import { useToast } from "@/hooks/use-toast";

interface SafeInputProps extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
  value: string | number;
  onChange: (value: string | number) => void;
  validate?: "text" | "number" | "none";
  maxLength?: number;
  showError?: boolean;
}

/**
 * Безопасный Input компонент с автоматической валидацией и защитой от XSS
 */
export const SafeInput = React.forwardRef<HTMLInputElement, SafeInputProps>(
  ({ className, type, value, onChange, validate = "text", maxLength = 200, showError = true, ...props }, ref) => {
    const { toast } = useToast();
    const [error, setError] = React.useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      
      // Для number типа сразу валидируем
      if (type === "number" || validate === "number") {
        const validation = validatePositiveInteger(newValue);
        if (validation.valid && validation.value !== undefined) {
          onChange(validation.value);
          setError(null);
        } else if (newValue === "" || newValue === "-" || newValue === ".") {
          // Разрешаем пустое значение во время ввода
          onChange(newValue);
          setError(null);
        } else {
          onChange(newValue);
          if (showError && validation.error) {
            setError(validation.error);
          }
        }
      } else if (validate === "text") {
        // Для текстовых полей валидируем на XSS и длину
        if (newValue.length > maxLength) {
          setError(`Максимальная длина: ${maxLength} символов`);
          return;
        }
        
        // Проверка на XSS
        if (/<[^>]*>|javascript:|on\w+=/i.test(newValue)) {
          setError("Некорректный ввод");
          if (showError) {
            toast({
              title: "Ошибка ввода",
              description: "Обнаружены недопустимые символы",
              variant: "destructive",
            });
          }
          return;
        }
        
        onChange(newValue);
        setError(null);
      } else {
        onChange(newValue);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      
      if (type === "number" || validate === "number") {
        const validation = validatePositiveInteger(newValue);
        if (!validation.valid && validation.error && showError) {
          toast({
            title: "Ошибка ввода",
            description: validation.error,
            variant: "destructive",
          });
          // Устанавливаем 0 если значение некорректно
          if (newValue === "" || isNaN(Number(newValue))) {
            onChange(0);
          }
        }
      } else if (validate === "text") {
        const validation = validateTextField(newValue, maxLength);
        if (!validation.valid && validation.error && showError) {
          toast({
            title: "Ошибка ввода",
            description: validation.error,
            variant: "destructive",
          });
        } else if (validation.valid && validation.value) {
          // Применяем санитизацию
          onChange(validation.value);
        }
      }
    };

    return (
      <div className="w-full">
        <Input
          ref={ref}
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          {...props}
        />
        {error && showError && (
          <p className="text-sm text-destructive mt-1">{error}</p>
        )}
      </div>
    );
  }
);

  SafeInput.displayName = "SafeInput";

