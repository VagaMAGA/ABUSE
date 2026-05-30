import { Suspense } from "react";

import { TokenApp } from "@/components/TokenApp";

export default function StakePage() {
  return (
    <main className="uni-page flex min-h-[100dvh] flex-col px-4 py-8">
      <div className="uni-content uni-shell flex flex-col gap-3">
        <Suspense fallback={null}>
          <TokenApp />
        </Suspense>
      </div>
    </main>
  );
}
