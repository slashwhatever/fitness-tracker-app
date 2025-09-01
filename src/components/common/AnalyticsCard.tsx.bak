import { Card, CardContent } from '@/components/ui/card';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

export default function AnalyticsCard({ title, value, subtitle, trend, icon }: AnalyticsCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-emerald-500 dark:text-emerald-400';
      case 'down': return 'text-red-500 dark:text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return (
          <svg className="w-4 h-4 text-emerald-500 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <Card role="region" aria-labelledby={`analytics-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p 
              id={`analytics-${title.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-sm font-medium text-muted-foreground"
            >
              {title}
            </p>
            <p className="text-3xl font-bold mt-2" aria-describedby={subtitle ? `subtitle-${title.toLowerCase().replace(/\s+/g, '-')}` : undefined}>
              {value}
            </p>
            {subtitle && (
              <div className="flex items-center mt-2">
                {getTrendIcon()}
                <p 
                  id={`subtitle-${title.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`text-sm ml-1 ${getTrendColor()}`}
                  aria-label={`Trend: ${trend === 'up' ? 'increasing' : trend === 'down' ? 'decreasing' : 'neutral'}, ${subtitle}`}
                >
                  {subtitle}
                </p>
              </div>
            )}
          </div>
          {icon && (
            <div className="text-muted-foreground" aria-hidden="true">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
