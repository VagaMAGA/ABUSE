import { Suspense } from "react";

import { AirdropApp } from "@/components/AirdropApp";

export default function AirdropPage() {
  return (
    <main className="uni-page flex min-h-[100dvh] flex-col px-4 py-8">
      <div className="uni-content uni-shell flex flex-col gap-3">
        <AirdropApp />
      </div>
    </main>
  );
}
