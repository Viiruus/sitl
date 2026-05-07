-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Aventure" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "sousTitre" TEXT,
    "discipline" TEXT NOT NULL,
    "formule" TEXT NOT NULL DEFAULT 'GRIMPE_SEULEMENT',
    "disciplinesComplementaires" JSONB,
    "lieuLabel" TEXT NOT NULL,
    "pays" TEXT DEFAULT 'France',
    "region" TEXT,
    "jours" REAL NOT NULL,
    "placesMax" INTEGER NOT NULL,
    "placesMin" INTEGER NOT NULL DEFAULT 0,
    "niveauMinimum" TEXT,
    "autonomieMini" TEXT,
    "prixParPersonne" INTEGER NOT NULL,
    "devise" TEXT NOT NULL DEFAULT 'EUR',
    "inclus" TEXT,
    "nonInclus" TEXT,
    "pointsLocaux" TEXT,
    "descriptionCourte" TEXT,
    "descriptionLongue" TEXT,
    "objectifs" TEXT,
    "prerequis" JSONB,
    "equipementRequis" JSONB,
    "equipementFourni" JSONB,
    "hebergementLabel" TEXT,
    "hebergementDetails" TEXT,
    "repasLabel" TEXT,
    "transportLabel" TEXT,
    "pointRdv" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "langues" JSONB,
    "ageMin" INTEGER,
    "ageMax" INTEGER,
    "coverImageUrl" TEXT,
    "coverImageVariants" JSONB,
    "guideId" INTEGER NOT NULL,
    "estPublie" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Aventure_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Aventure" ("ageMax", "ageMin", "autonomieMini", "coverImageUrl", "coverImageVariants", "createdAt", "descriptionCourte", "descriptionLongue", "devise", "discipline", "disciplinesComplementaires", "equipementFourni", "equipementRequis", "estPublie", "formule", "guideId", "hebergementDetails", "hebergementLabel", "id", "inclus", "jours", "langues", "latitude", "lieuLabel", "longitude", "niveauMinimum", "nonInclus", "objectifs", "pays", "placesMax", "placesMin", "pointRdv", "pointsLocaux", "prerequis", "prixParPersonne", "region", "repasLabel", "slug", "sousTitre", "titre", "transportLabel", "updatedAt") SELECT "ageMax", "ageMin", "autonomieMini", "coverImageUrl", "coverImageVariants", "createdAt", "descriptionCourte", "descriptionLongue", "devise", "discipline", "disciplinesComplementaires", "equipementFourni", "equipementRequis", "estPublie", "formule", "guideId", "hebergementDetails", "hebergementLabel", "id", "inclus", "jours", "langues", "latitude", "lieuLabel", "longitude", "niveauMinimum", "nonInclus", "objectifs", "pays", "placesMax", "placesMin", "pointRdv", "pointsLocaux", "prerequis", "prixParPersonne", "region", "repasLabel", "slug", "sousTitre", "titre", "transportLabel", "updatedAt" FROM "Aventure";
DROP TABLE "Aventure";
ALTER TABLE "new_Aventure" RENAME TO "Aventure";
CREATE UNIQUE INDEX "Aventure_slug_key" ON "Aventure"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
