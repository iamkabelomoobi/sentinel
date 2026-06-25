import { AuthHero } from './auth-hero';

type AuthShellProps = {
  children: React.ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[1fr_0.92fr]">
        <AuthHero />

        <section className="relative flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_50%_35%,rgba(14,165,233,0.13),transparent_34%),linear-gradient(180deg,#06111f_0%,#020617_100%)] px-5 py-10 sm:px-8">
          <div className="absolute inset-y-0 left-0 hidden w-px bg-cyan-300/10 lg:block" />
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-cyan-500/6 to-transparent" />
          <div className="relative z-10 w-full">{children}</div>
          <div className="absolute bottom-6 right-8 hidden gap-7 text-xs text-slate-500 md:flex">
            <a href="#" className="transition hover:text-slate-300">
              Privacy Policy
            </a>
            <a href="#" className="transition hover:text-slate-300">
              Terms of Service
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}