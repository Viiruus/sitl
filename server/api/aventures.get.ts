// server/api/aventures.get.ts
import { prisma } from "../utils/prisma";
import { sanitizePublicImageUrl, sanitizePublicImageVariants } from "../utils/public-image";
import { buildGuideSlug } from "~~/shared/utils/guide-slug";

export default defineEventHandler(async (event) => {
  setHeader(event, "cache-control", "no-store");
  const db = await prisma();
  const query = getQuery(event);
  const mode = typeof query.mode === "string" ? query.mode : null;
  const limit = parsePositiveInt(query.limit, 3);
  const today = startOfToday();
  const upcomingSessionWhere = buildUpcomingSessionWhere(today);

  if (mode === "home") {
    const aventures = await db.aventure.findMany({
      where: {
        estPublie: true,
        sessions: {
          some: upcomingSessionWhere,
        },
      },
      select: {
        id: true,
        slug: true,
        estPublie: true,
        titre: true,
        sousTitre: true,
        discipline: true,
        formule: true,
        lieuLabel: true,
        jours: true,
        placesMax: true,
        prixParPersonne: true,
        coverImageUrl: true,
        coverImageVariants: true,
        guide: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            guideProfile: {
              select: { profileImageUrl: true, profileImageVariants: true, baseLocation: true, gender: true },
            },
          },
        },
        sessions: {
          where: upcomingSessionWhere,
          select: {
            dateDebut: true,
            dateFin: true,
            placesReservees: true,
          },
          orderBy: {
            dateDebut: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { aventures: selectHomepageAventures(aventures, limit) };
  }

  const aventures = await db.aventure.findMany({
    where: {
      estPublie: true,
      sessions: {
        some: upcomingSessionWhere,
      },
    },
    include: {
      guide: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          department: true,
          guideProfile: {
            select: { profileImageUrl: true, profileImageVariants: true, baseLocation: true, gender: true },
          },
        },
      },
      sessions: {
        where: upcomingSessionWhere,
        orderBy: {
          dateDebut: "asc",
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    aventures: aventures.map((a) => ({
      ...sanitizePublicImageFieldSet(a.coverImageUrl, a.coverImageVariants, "cover", true),
      ...sanitizePublicImageFieldSet(a.guide?.guideProfile?.profileImageUrl, a.guide?.guideProfile?.profileImageVariants, "guide", true),
      id: a.id,
      slug: a.slug,
      estPublie: a.estPublie,
      titre: a.titre,
      sousTitre: a.sousTitre,
      discipline: a.discipline,
      formule: a.formule,
      lieuLabel: a.lieuLabel,
      latitude: a.latitude,
      longitude: a.longitude,
      jours: a.jours,
      prixParPersonne: a.prixParPersonne,
      guideName: [a.guide?.firstName, a.guide?.lastName].filter(Boolean).join(" ") || null,
      guideSlug:
        a.guide?.id != null
          ? buildGuideSlug(a.guide?.firstName, a.guide?.lastName, a.guide.id)
          : null,
      guideDepartment: a.guide?.department || null,
      guideBaseLocation: a.guide?.guideProfile?.baseLocation || null,
      guideGender: a.guide?.guideProfile?.gender || null,
      hasSessions: a.sessions.length > 0,
      nextSession: findNextSession(a.sessions),
      estComplet: isStageSoldOut(a.sessions, a.placesMax),
    })),
  };
});

const parsePositiveInt = (value: unknown, fallback: number) => {
  if (typeof value !== "string") return fallback;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(1, Math.min(parsed, 12));
};

const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const buildUpcomingSessionWhere = (today: Date) => ({
  OR: [
    { dateFin: { gte: today } },
    { dateDebut: { gte: today } },
  ],
});

const isStageSoldOut = (sessions: any[], placesMax?: number | null) => {
  const capacity = Number(placesMax ?? 0)
  if (!capacity || !Array.isArray(sessions) || sessions.length === 0) return false
  return sessions.every((session: any) => Number(session?.placesReservees ?? 0) >= capacity)
}

const selectHomepageAventures = (aventures: any[], limit: number) => {
  const list = aventures
    .map((a) => {
      const nextSession = findNextSession(a.sessions);
      const nextSessionDate = nextSession?.dateDebut ? new Date(nextSession.dateDebut).getTime() : null;

      return {
        ...sanitizePublicImageFieldSet(a.coverImageUrl, a.coverImageVariants, "cover", true),
        ...sanitizePublicImageFieldSet(a.guide?.guideProfile?.profileImageUrl, a.guide?.guideProfile?.profileImageVariants, "guide", true),
        id: a.id,
        slug: a.slug,
        estPublie: a.estPublie,
        titre: a.titre,
        sousTitre: a.sousTitre,
        discipline: a.discipline,
        formule: a.formule,
        lieuLabel: a.lieuLabel,
        latitude: a.latitude,
        longitude: a.longitude,
        jours: a.jours,
        prixParPersonne: a.prixParPersonne,
        guideName: [a.guide?.firstName, a.guide?.lastName].filter(Boolean).join(" ") || null,
        guideSlug:
          a.guide?.id != null
            ? buildGuideSlug(a.guide?.firstName, a.guide?.lastName, a.guide.id)
            : null,
        guideDepartment: a.guide?.department || null,
        guideBaseLocation: a.guide?.guideProfile?.baseLocation || null,
        guideGender: a.guide?.guideProfile?.gender || null,
        nextSession,
        nextSessionDate,
        estComplet: isStageSoldOut(a.sessions, a.placesMax),
      };
    })
    .filter((stage) => stage.nextSessionDate)
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
  allowInline = false,
) => {
  const safeUrl = sanitizePublicImageUrl(url, { allowInline });
  const safeVariants = sanitizePublicImageVariants(variants, { allowInline });

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
