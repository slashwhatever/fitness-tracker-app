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
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return (
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-300">{title}</p>
          <p className="text-3xl font-bold text-slate-50 mt-2">{value}</p>
          {subtitle && (
            <div className="flex items-center mt-2">
              {getTrendIcon()}
              <p className={`text-sm ml-1 ${getTrendColor()}`}>{subtitle}</p>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-slate-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
