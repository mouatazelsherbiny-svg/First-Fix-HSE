import { getBadgeClasses } from "@/lib/statusColors";

export default function Badge({
  value,
  label,
  dark = true,
  className = "",
}: {
  /** The semantic (always-English) word used to look up the color. */
  value: string;
  /** What to display, if different from `value` (e.g. a translated label). */
  label?: string;
  /** The app's cards are dark by default now, so the translucent variant
   *  is the default too. Pass `false` only for a badge placed on a light
   *  surface. */
  dark?: boolean;
  className?: string;
}) {
  return (
    <span className={`${getBadgeClasses(value, dark)} ${className}`}>
      {label ?? value}
    </span>
  );
}
