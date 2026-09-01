import { getBadgeClasses } from "@/lib/statusColors";

export default function Badge({
  value,
  label,
  dark = false,
  className = "",
}: {
  /** The semantic (always-English) word used to look up the color. */
  value: string;
  /** What to display, if different from `value` (e.g. a translated label). */
  label?: string;
  /** Use the translucent dark-card variant (e.g. on a black panel). */
  dark?: boolean;
  className?: string;
}) {
  return (
    <span className={`${getBadgeClasses(value, dark)} ${className}`}>
      {label ?? value}
    </span>
  );
}
