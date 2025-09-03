import { Dumbbell } from "lucide-react";
import { Typography } from "./common/Typography";

interface LoadingProps {
  title?: string;
  subtitle?: string;
}

const Loading = ({ title = "Loading...", subtitle = "Please wait while we load the page" }: LoadingProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Dumbbell className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
        <Typography variant="title2">{title}</Typography>
        {subtitle && <Typography variant="caption">{subtitle}</Typography>}
      </div>
    </div>
  );
};

export default Loading;