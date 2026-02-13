// server/api/aventures.get.ts
import { prisma } from "../utils/prisma";
import { sanitizePublicImageUrl, sanitizePublicImageVariants } from "../utils/public-image";

export default defineEventHandler(async (event) => {
  const db = await prisma();
  const query = getQuery(event);
  const mode = typeof query.mode === "string" ? query.mode : null;
  const limit = parsePositiveInt(query.limit, 3);

  if (mode === "home") {
    const aventures = await db.aventure.findMany({
      where: { estPublie: true },
      select: {
        id: true,
        slug: true,
        titre: true,
        sousTitre: true,
        discipline: true,
        formule: true,
        lieuLabel: true,
        jours: true,
        prixParPersonne: true,
        coverImageUrl: true,
        coverImageVariants: true,
        guide: {
          select: {
            firstName: true,
            lastName: true,
            guideProfile: {
              select: { profileImageUrl: true, profileImageVariants: true },
            },
          },
        },
        sessions: {
          select: {
            dateDebut: true,
            dateFin: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      aventures: selectHomepageAventures(aventures, limit),
    };
  }

  const aventures = await db.aventure.findMany({
    where: { estPublie: true },
    include: {
      guide: {
        select: {
          firstName: true,
          lastName: true,
          guideProfile: {
            select: { profileImageUrl: true, profileImageVariants: true },
          },
        },
      },
      sessions: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    aventures: aventures.map((a) => ({
      ...sanitizePublicImageFieldSet(a.coverImageUrl, a.coverImageVariants, "cover"),
      ...sanitizePublicImageFieldSet(a.guide?.guideProfile?.profileImageUrl, a.guide?.guideProfile?.profileImageVariants, "guide"),
      id: a.id,
      slug: a.slug,
      titre: a.titre,
      sousTitre: a.sousTitre,
      discipline: a.discipline,
      formule: a.formule,
      lieuLabel: a.lieuLabel,
      jours: a.jours,
      prixParPersonne: a.prixParPersonne,
      guideName: [a.guide?.firstName, a.guide?.lastName].filter(Boolean).join(" ") || null,
      hasSessions: a.sessions.length > 0,
      nextSession: findNextSession(a.sessions),
    })),
  };
});

const parsePositiveInt = (value: unknown, fallback: number) => {
  if (typeof value !== "string") return fallback;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(1, Math.min(parsed, 12));
};

const selectHomepageAventures = (aventures: any[], limit: number) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();

  const list = aventures
    .map((a) => {
      const nextSession = findNextSession(a.sessions);
      const nextSessionDate = nextSession?.dateDebut ? new Date(nextSession.dateDebut).getTime() : null;
      const hasSessions = Array.isArray(a.sessions) && a.sessions.length > 0;

      return {
        ...sanitizePublicImageFieldSet(a.coverImageUrl, a.coverImageVariants, "cover"),
        ...sanitizePublicImageFieldSet(a.guide?.guideProfile?.profileImageUrl, a.guide?.guideProfile?.profileImageVariants, "guide"),
        id: a.id,
        slug: a.slug,
        titre: a.titre,
        sousTitre: a.sousTitre,
        discipline: a.discipline,
        formule: a.formule,
        lieuLabel: a.lieuLabel,
        jours: a.jours,
        prixParPersonne: a.prixParPersonne,
        guideName: [a.guide?.firstName, a.guide?.lastName].filter(Boolean).join(" ") || null,
        hasSessions,
        nextSession,
        nextSessionDate,
      };
    })
    .filter((stage) => {
      if (stage.nextSessionDate) return stage.nextSessionDate >= todayMs;
      if (stage.hasSessions) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.nextSessionDate && b.nextSessionDate) return a.nextSessionDate - b.nextSessionDate;
      if (a.nextSessionDate && !b.nextSessionDate) return -1;
      if (!a.nextSessionDate && b.nextSessionDate) return 1;
      return 0;
    })
    .slice(0, limit)
    .map(({ nextSessionDate, ...stage }) => stage);

  return list;
};

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

const sanitizePublicImageFieldSet = (
  url: unknown,
  variants: unknown,
  prefix: "cover" | "guide",
) => {
  const safeUrl = sanitizePublicImageUrl(url);
  const safeVariants = sanitizePublicImageVariants(variants);

  if (prefix === "cover") {
    return {
      coverImageUrl: safeUrl,
      coverImageVariants: safeVariants,
    };
  }

  return {
    guideImageUrl: safeUrl,
    guideImageVariants: safeVariants,
  };
};
