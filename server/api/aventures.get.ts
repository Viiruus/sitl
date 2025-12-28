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
      nextSession: a.sessions.sort((s1, s2) => +s1.dateDebut - +s2.dateDebut)[0] ?? null,
    })),
  };
});

