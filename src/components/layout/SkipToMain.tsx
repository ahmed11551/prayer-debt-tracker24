/**
 * Компонент "Skip to main content" для улучшения доступности
 * Позволяет пользователям скринридеров быстро перейти к основному контенту
 */
export const SkipToMain = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      aria-label="Перейти к основному контенту"
    >
      Перейти к основному контенту
    </a>
  );
};

