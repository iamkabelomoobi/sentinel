import { Laptop, Smartphone } from "lucide-react";

export default function MobileNotSupportedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Smartphone className="h-10 w-10 text-muted-foreground" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight">
          Mobile devices are not supported
        </h1>

        <p className="mt-4 text-muted-foreground">
          Sentinel is optimized for desktop and laptop screens. Please open it
          from a desktop browser to continue.
        </p>

        <div className="mt-8 inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-3 text-sm">
          <Laptop className="h-5 w-5" />
          Recommended: desktop Chrome, Edge, Firefox, or Safari.
        </div>
      </div>
    </main>
  );
}