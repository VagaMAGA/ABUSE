import { Suspense } from "react";

import { ReferralApp } from "@/components/ReferralApp";

export default function ReferralPage() {
  return (
    <main className="uni-page flex min-h-[100dvh] flex-col px-4 py-8">
      <div className="uni-content uni-shell flex flex-col gap-3">
        <Suspense fallback={null}>
          <ReferralApp />
        </Suspense>
      </div>
    </main>
  );
}
