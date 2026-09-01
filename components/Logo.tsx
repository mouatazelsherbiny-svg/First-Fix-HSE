import Image from "next/image";

export default function Logo({
  size = 56,
  showText = false,
}: {
  size?: number;
  showText?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Image
        src="/logo-icon.png"
        alt="First Fix HSE"
        width={size}
        height={size}
        className="object-contain"
        priority
      />
      {showText && (
        <span className="text-lg font-bold text-brand-black">
          First Fix <span className="text-brand-orange">HSE</span>
        </span>
      )}
    </div>
  );
}
