import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";

const colorFromName = (name: string) => {
  const palette = ["#4F46E5", "#7C3AED", "#16B364", "#F5A623", "#3B82F6", "#EF4444"];
  const idx = name.charCodeAt(0) % palette.length;
  return palette[idx];
};

export function Avatar({
  name,
  size = 40,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold text-white",
        className
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        backgroundColor: colorFromName(name),
      }}
    >
      {initials(name)}
    </div>
  );
}
