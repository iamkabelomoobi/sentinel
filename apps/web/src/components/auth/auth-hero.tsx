import Image from "next/image";
import { Bot, Camera, ClipboardList, MapPin, Shield } from "lucide-react";

const features = [
  {
    title: "Live Tracking",
    description: "Real-time location and updates",
    icon: MapPin,
    color: "text-sky-400",
  },
  {
    title: "Smart Dispatch",
    description: "Right responder, right time",
    icon: Bot,
    color: "text-emerald-400",
  },
  {
    title: "Evidence Capture",
    description: "Photos, notes and attachments",
    icon: Camera,
    color: "text-cyan-300",
  },
  {
    title: "Audit & Reports",
    description: "Complete audit trail and reports",
    icon: ClipboardList,
    color: "text-amber-300",
  },
];

export function AuthHero() {
  return (
    <section className="relative hidden min-h-screen overflow-hidden border-r border-white/10 bg-[#020912] lg:block">
     <div className="absolute inset-0 bg-[#020912]">
  <Image
    src="/hero-bg.png"
    alt=""
    fill
    priority
    sizes="100vw"
      className="object-cover object-[50%_60%] scale-100"

  />
</div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.96)_0%,rgba(2,8,18,0.72)_36%,rgba(2,8,18,0.08)_72%,rgba(2,8,18,0.86)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#020617] via-[#020617]/70 to-transparent" />

      <div className="relative z-10 flex min-h-screen flex-col justify-between p-10 xl:p-12">
        <div>
          <div className="mb-8 flex flex-col items-start gap-4">
            <div className="flex size-14 items-center justify-center rounded-[1.1rem] border border-cyan-400/80 bg-slate-950/45 text-cyan-300 shadow-[0_0_24px_rgba(14,165,233,0.28)]">
              <Shield aria-hidden="true" className="size-9" strokeWidth={1.8} />
            </div>
            <span className="text-[2rem] font-semibold leading-none tracking-[0.24em] text-white">
              SENTINEL
            </span>
          </div>

          <h1 className="max-w-[25rem] text-[1.72rem] font-semibold leading-tight text-white">
            Real-Time <span className="text-cyan-400">Incident Response</span>
          </h1>

          <p className="mt-4 max-w-[23rem] text-sm leading-6 text-slate-300">
            Raise incidents, dispatch responders, track operations, and maintain
            complete visibility from alert to resolution.
          </p>
        </div>

        <div>
          <div className="mb-10 grid grid-cols-4 gap-3">
            {features.map(({ title, description, icon: Icon, color }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/8 bg-slate-950/32 px-3 py-4 text-center shadow-[0_18px_40px_rgba(0,0,0,0.24)] backdrop-blur"
              >
                <Icon
                  aria-hidden="true"
                  className={`mx-auto mb-3 size-5 ${color}`}
                  strokeWidth={1.9}
                />
                <p className="text-[0.68rem] font-semibold leading-tight text-white">
                  {title}
                </p>
                <p className="mt-1 text-[0.62rem] leading-4 text-slate-400">
                  {description}
                </p>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-500">
            © 2026 Sentinel. All rights reserved.
          </p>
        </div>
      </div>
    </section>
  );
}
