import Image from "next/image";
import { cn } from "@/lib/utils";

export default function LogoSquare({ size }: { size?: "sm" | undefined }) {
  return (
    <div
      className={cn(
        "relative flex size-10 overflow-hidden items-center justify-center shrink-0",
        {
          "size-8": size === "sm",
        },
      )}
    >
      <Image
        src="/icon.png"
        alt="স্বাস্থ্যকর"
        fill
        sizes="40px"
        className="object-contain"
        priority
      />
    </div>
  );
}
