import { fetchReferralsForReferrer, friendlyReferralsError } from "@/lib/fetchReferrals";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const referrer = new URL(request.url).searchParams.get("referrer");

  if (!referrer) {
    return Response.json({ error: "Missing referrer address" }, { status: 400 });
  }

  try {
    const { configured, referrals } = await fetchReferralsForReferrer(referrer);
    return Response.json({ configured, referrals, total: referrals.length });
  } catch (error) {
    const message = friendlyReferralsError(error);
    return Response.json(
      { configured: true, referrals: [], total: 0, error: message },
      { status: 503 },
    );
  }
}
