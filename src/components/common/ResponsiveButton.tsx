import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VariantProps } from "class-variance-authority";

type ResponsiveButtonSizes = 'sm' | 'lg' | 'icon' | 'default';

type ResponsiveButtonColors =
  | 'primary'
  | 'slate' | 'gray' | 'zinc' | 'neutral' | 'stone'
  | 'red' | 'orange' | 'amber' | 'yellow' | 'lime'
  | 'green' | 'emerald' | 'teal' | 'cyan' | 'sky'
  | 'blue' | 'indigo' | 'violet' | 'purple'
  | 'fuchsia' | 'pink' | 'rose';

// Color mappings for reliable Tailwind class generation
const colorMap: Record<ResponsiveButtonColors, { 
  text: string; 
  bg: string; 
  hover: string; 
  hoverText: string;
  smText: string;
  smBorder: string;
  smHoverBg: string;
}> = {
  primary: { text: 'text-primary', bg: 'bg-primary', hover: 'hover:bg-primary/90', hoverText: 'hover:text-primary', smText: 'sm:text-primary', smBorder: 'sm:border-primary', smHoverBg: 'sm:hover:!bg-primary' },
  slate: { text: 'text-slate-500', bg: 'bg-slate-500', hover: 'hover:bg-slate-600', hoverText: 'hover:text-slate-500', smText: 'sm:text-slate-500', smBorder: 'sm:border-slate-500', smHoverBg: 'sm:hover:!bg-slate-500' },
  gray: { text: 'text-gray-500', bg: 'bg-gray-500', hover: 'hover:bg-gray-600', hoverText: 'hover:text-gray-500', smText: 'sm:text-gray-500', smBorder: 'sm:border-gray-500', smHoverBg: 'sm:hover:!bg-gray-500' },
  zinc: { text: 'text-zinc-500', bg: 'bg-zinc-500', hover: 'hover:bg-zinc-600', hoverText: 'hover:text-zinc-500', smText: 'sm:text-zinc-500', smBorder: 'sm:border-zinc-500', smHoverBg: 'sm:hover:!bg-zinc-500' },
  neutral: { text: 'text-neutral-500', bg: 'bg-neutral-500', hover: 'hover:bg-neutral-600', hoverText: 'hover:text-neutral-500', smText: 'sm:text-neutral-500', smBorder: 'sm:border-neutral-500', smHoverBg: 'sm:hover:!bg-neutral-500' },
  stone: { text: 'text-stone-500', bg: 'bg-stone-500', hover: 'hover:bg-stone-600', hoverText: 'hover:text-stone-500', smText: 'sm:text-stone-500', smBorder: 'sm:border-stone-500', smHoverBg: 'sm:hover:!bg-stone-500' },
  red: { text: 'text-red-500', bg: 'bg-red-500', hover: 'hover:bg-red-600', hoverText: 'hover:text-red-500', smText: 'sm:text-red-500', smBorder: 'sm:border-red-500', smHoverBg: 'sm:hover:!bg-red-500' },
  orange: { text: 'text-orange-500', bg: 'bg-orange-500', hover: 'hover:bg-orange-600', hoverText: 'hover:text-orange-500', smText: 'sm:text-orange-500', smBorder: 'sm:border-orange-500', smHoverBg: 'sm:hover:!bg-orange-500' },
  amber: { text: 'text-amber-500', bg: 'bg-amber-500', hover: 'hover:bg-amber-600', hoverText: 'hover:text-amber-500', smText: 'sm:text-amber-500', smBorder: 'sm:border-amber-500', smHoverBg: 'sm:hover:!bg-amber-500' },
  yellow: { text: 'text-yellow-500', bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600', hoverText: 'hover:text-yellow-500', smText: 'sm:text-yellow-500', smBorder: 'sm:border-yellow-500', smHoverBg: 'sm:hover:!bg-yellow-500' },
  lime: { text: 'text-lime-500', bg: 'bg-lime-500', hover: 'hover:bg-lime-600', hoverText: 'hover:text-lime-500', smText: 'sm:text-lime-500', smBorder: 'sm:border-lime-500', smHoverBg: 'sm:hover:!bg-lime-500' },
  green: { text: 'text-green-500', bg: 'bg-green-500', hover: 'hover:bg-green-600', hoverText: 'hover:text-green-500', smText: 'sm:text-green-500', smBorder: 'sm:border-green-500', smHoverBg: 'sm:hover:!bg-green-500' },
  emerald: { text: 'text-emerald-500', bg: 'bg-emerald-500', hover: 'hover:bg-emerald-600', hoverText: 'hover:text-emerald-500', smText: 'sm:text-emerald-500', smBorder: 'sm:border-emerald-500', smHoverBg: 'sm:hover:!bg-emerald-500' },
  teal: { text: 'text-teal-500', bg: 'bg-teal-500', hover: 'hover:bg-teal-600', hoverText: 'hover:text-teal-500', smText: 'sm:text-teal-500', smBorder: 'sm:border-teal-500', smHoverBg: 'sm:hover:!bg-teal-500' },
  cyan: { text: 'text-cyan-500', bg: 'bg-cyan-500', hover: 'hover:bg-cyan-600', hoverText: 'hover:text-cyan-500', smText: 'sm:text-cyan-500', smBorder: 'sm:border-cyan-500', smHoverBg: 'sm:hover:!bg-cyan-500' },
  sky: { text: 'text-sky-500', bg: 'bg-sky-500', hover: 'hover:bg-sky-600', hoverText: 'hover:text-sky-500', smText: 'sm:text-sky-500', smBorder: 'sm:border-sky-500', smHoverBg: 'sm:hover:!bg-sky-500' },
  blue: { text: 'text-blue-500', bg: 'bg-blue-500', hover: 'hover:bg-blue-600', hoverText: 'hover:text-blue-500', smText: 'sm:text-blue-500', smBorder: 'sm:border-blue-500', smHoverBg: 'sm:hover:!bg-blue-500' },
  indigo: { text: 'text-indigo-500', bg: 'bg-indigo-500', hover: 'hover:bg-indigo-600', hoverText: 'hover:text-indigo-500', smText: 'sm:text-indigo-500', smBorder: 'sm:border-indigo-500', smHoverBg: 'sm:hover:!bg-indigo-500' },
  violet: { text: 'text-violet-500', bg: 'bg-violet-500', hover: 'hover:bg-violet-600', hoverText: 'hover:text-violet-500', smText: 'sm:text-violet-500', smBorder: 'sm:border-violet-500', smHoverBg: 'sm:hover:!bg-violet-500' },
  purple: { text: 'text-purple-500', bg: 'bg-purple-500', hover: 'hover:bg-purple-600', hoverText: 'hover:text-purple-500', smText: 'sm:text-purple-500', smBorder: 'sm:border-purple-500', smHoverBg: 'sm:hover:!bg-purple-500' },
  fuchsia: { text: 'text-fuchsia-500', bg: 'bg-fuchsia-500', hover: 'hover:bg-fuchsia-600', hoverText: 'hover:text-fuchsia-500', smText: 'sm:text-fuchsia-500', smBorder: 'sm:border-fuchsia-500', smHoverBg: 'sm:hover:!bg-fuchsia-500' },
  pink: { text: 'text-pink-500', bg: 'bg-pink-500', hover: 'hover:bg-pink-600', hoverText: 'hover:text-pink-500', smText: 'sm:text-pink-500', smBorder: 'sm:border-pink-500', smHoverBg: 'sm:hover:!bg-pink-500' },
  rose: { text: 'text-rose-500', bg: 'bg-rose-500', hover: 'hover:bg-rose-600', hoverText: 'hover:text-rose-500', smText: 'sm:text-rose-500', smBorder: 'sm:border-rose-500', smHoverBg: 'sm:hover:!bg-rose-500' }
};

type ResponsiveButtonProps = {
  children: React.ReactNode;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  size?: ResponsiveButtonSizes;
  color: ResponsiveButtonColors;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'secondary' | 'destructive';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
} & React.ComponentProps<"button"> &
VariantProps<typeof buttonVariants> & {
  asChild?: boolean
}

export const ResponsiveButton = ({ children, icon: Icon, size = 'icon', color, className, variant = 'ghost', onClick, ...props }: ResponsiveButtonProps) => {
  const colors = colorMap[color];
  const hoverTextColor = color === 'primary' ? 'sm:hover:!text-primary-foreground' : 'sm:hover:!text-white';
  
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        // Base mobile styles: square button with colored icon
        colors.text, 
        colors.hoverText, 
        "hover:bg-accent/50",
        // Desktop styles: outline default, colored background on hover
        "sm:size-auto sm:px-4 sm:py-2 sm:has-[>svg]:px-3",
        "sm:border",
        colors.smText,
        colors.smBorder,
        colors.smHoverBg,
        hoverTextColor,
        "sm:hover:!border-transparent",
        className
      )}
      onClick={onClick}
      {...props}
    >
      <span className="flex items-center gap-1">
        <Icon />
        <span className="hidden sm:inline">{children}</span>
      </span>
    </Button>
  );
};

export default ResponsiveButton;