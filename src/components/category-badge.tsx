import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  name: string;
  color: string;
  className?: string;
}

export function CategoryBadge({ name, color, className }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        className
      )}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}30`,
      }}
    >
      {name}
    </span>
  );
}
