import { AppLogo } from "@/components/AppLogo";
import { ConnectWallet } from "@/components/ConnectWallet";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@/config/app";

export default function Home() {
  return (
    <main className="uni-page flex min-h-[100dvh] flex-col px-4 py-8">
      <div className="uni-content uni-shell flex flex-col gap-6">
        <header className="flex flex-col items-center gap-3 text-center">
          <AppLogo size={64} />
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-[var(--uni-text)]">
              {APP_NAME}
            </h1>
            <p className="text-sm text-[var(--uni-text-secondary)]">
              {APP_TAGLINE}
            </p>
          </div>
        </header>

        <section className="uni-card flex flex-col gap-4 p-5">
          <p className="text-sm leading-relaxed text-[var(--uni-text-secondary)]">
            {APP_DESCRIPTION}
          </p>
          <ConnectWallet />
        </section>
      </div>
    </main>
  );
}
