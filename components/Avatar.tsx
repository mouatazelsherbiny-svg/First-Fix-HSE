interface AvatarProps {
  /** Full name — used to derive the fallback initial and the alt text. */
  name: string;
  /** Real photo URL. Omit/undefined to show the initials fallback. */
  src?: string;
  /** Diameter in pixels. */
  size?: number;
  className?: string;
}

export default function Avatar({
  name,
  src,
  size = 36,
  className = "",
}: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const style = { width: size, height: size };

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        style={style}
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      style={style}
      title={name}
      className={`flex shrink-0 items-center justify-center rounded-full bg-brand-orange font-bold text-white ${className}`}
    >
      <span style={{ fontSize: size * 0.42 }}>{initial}</span>
    </div>
  );
}
