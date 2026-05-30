import { redirect } from "next/navigation";

export default function AirdropPage() {
  redirect("/stake?tab=claim");
}
