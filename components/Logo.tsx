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
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-base font-extrabold uppercase tracking-wide text-brand-black">
            First Fix <span className="text-brand-orange">HSE</span>
          </span>
          <span className="block truncate text-[10px] font-semibold uppercase tracking-wider text-brand-gray">
            Department
          </span>
        </span>
      )}
    </div>
  );
}
