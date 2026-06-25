import Image from "next/image";

type AuthCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  tone?: "brand" | "success" | "danger";
};

const toneClassName = {
  brand: "border-cyan-400/40 text-cyan-300 shadow-cyan-500/25",
  success: "border-cyan-300/50 text-cyan-200 shadow-cyan-500/30",
  danger: "border-red-400/60 text-red-300 shadow-red-500/30",
};

export function AuthCard({
  title,
  description,
  children,
  tone = "brand",
}: AuthCardProps) {
  return (
    <div className="auth-panel w-full max-w-[430px]">
      <div className="mb-7 text-center">
        <div
          className={`relative mx-auto mb-5 flex size-24 items-center justify-center overflow-hidden rounded-full border bg-slate-950/65 shadow-[0_0_42px] ${toneClassName[tone]}`}
        >
          <Image
            src="/logo.png"
            alt="Sentinel"
            fill
            priority
            className="object-contain scale-110"
          />
        </div>
        <h2 className="text-[1.38rem] font-semibold leading-tight text-white">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-5 text-slate-400">{description}</p>
      </div>

      {children}
    </div>
  );
}
