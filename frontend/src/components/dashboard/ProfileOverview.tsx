import { StatsRow } from "./StatsRow";
import { BadgeCheck } from "lucide-react";
import { useAuth } from "../../App";
import type { Profile } from "../../data/mockData";

interface ProfileOverviewProps {
  profile?: Profile;
}

export function ProfileOverview({ profile }: ProfileOverviewProps) {
  const { user } = useAuth();

  if (!user && !profile) return null;

  const initials = (profile?.username ?? user?.username ?? "User").slice(0, 2).toUpperCase();
  const avatarSvg = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><rect width='80' height='80' rx='40' fill='oklch(0.62 0.19 30)'/><text x='50%' y='56%' fill='white' font-family='Inter' font-size='32' font-weight='700' text-anchor='middle'>${initials}</text></svg>`
  )}`;

  const displayProfile = profile ?? {
    username: user?.username ?? "User",
    handle: user?.username ? `@${user.username}` : "@user",
    role: "learner" as const,
    bio: "",
    avatar: avatarSvg,
    stats: { likes: 0, saved: 0, subscribers: 0, uploads: 0 },
  };

  const stats = displayProfile.stats;

  return (
    <section
      aria-label="Profile overview"
      className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
    >
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-primary opacity-90" />
      <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary-glow)/0.6),transparent_60%)]" />

      <div className="relative pt-20 sm:pt-24 px-5 sm:px-8 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-5">
          <img
            src={displayProfile.avatar || avatarSvg}
            alt={displayProfile.username}
            className="size-24 sm:size-28 rounded-2xl ring-4 ring-card shadow-elevated -mt-12 sm:-mt-16"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                {displayProfile.username}
              </h1>
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                <BadgeCheck className="size-3" />
                Member
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{displayProfile.handle}</p>
          </div>
        </div>

        <div className="mt-6">
          <StatsRow stats={stats} />
        </div>
      </div>
    </section>
  );
}