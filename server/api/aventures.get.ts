// server/api/aventures.get.ts
import { prisma } from "../utils/prisma";

export default defineEventHandler(async () => {
  const db = await prisma();

  const aventures = await db.aventure.findMany({
    where: { estPublie: true },
    include: {
      guide: {
        select: {
          firstName: true,
          lastName: true,
          guideProfile: {
            select: { profileImageUrl: true },
          },
        },
      },
      sessions: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    aventures: aventures.map((a) => ({
      id: a.id,
      slug: a.slug,
      titre: a.titre,
      sousTitre: a.sousTitre,
      discipline: a.discipline,
      formule: a.formule,
      lieuLabel: a.lieuLabel,
      jours: a.jours,
      prixParPersonne: a.prixParPersonne,
      coverImageUrl: a.coverImageUrl,
      guideName: [a.guide?.firstName, a.guide?.lastName].filter(Boolean).join(" ") || null,
      guideImageUrl: a.guide?.guideProfile?.profileImageUrl || null,
      hasSessions: a.sessions.length > 0,
      nextSession: findNextSession(a.sessions),
    })),
  };
});

const findNextSession = (sessions: any[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();

  const future = (sessions ?? [])
    .filter((s: any) => s?.dateDebut)
    .map((s: any) => ({ ...s, _ts: new Date(s.dateDebut).getTime() }))
    .filter((s: any) => !Number.isNaN(s._ts) && s._ts >= todayMs)
    .sort((a: any, b: any) => a._ts - b._ts);

  if (!future.length) return null;
  const best = { ...future[0] };
  delete best._ts;
  return best;
};
