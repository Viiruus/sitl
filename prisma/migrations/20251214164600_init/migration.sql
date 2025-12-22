-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "googleId" TEXT,
    "facebookId" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CLIMBER',
    "acquisitionSource" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "birthDate" TEXT,
    "department" TEXT,
    "typesOfClimbing" JSONB,
    "climbsMainly" TEXT,
    "environments" JSONB,
    "autonomy" JSONB,
    "frequency" TEXT,
    "gradeLevel" TEXT,
    "tripStyles" JSONB,
    "onboarded" BOOLEAN NOT NULL DEFAULT false,
    "onboardingStep" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GuideProfile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "bio" TEXT,
    "baseLocation" TEXT,
    "instagramUrl" TEXT,
    "websiteUrl" TEXT,
    "profileImageUrl" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GuideProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Aventure" (
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
    "jours" INTEGER NOT NULL,
    "placesMax" INTEGER NOT NULL,
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
    "langues" JSONB,
    "ageMin" INTEGER,
    "ageMax" INTEGER,
    "coverImageUrl" TEXT,
    "guideId" INTEGER NOT NULL,
    "estPublie" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Aventure_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AventureImage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "aventureId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'GALLERY',
    "alt" TEXT,
    "position" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AventureImage_aventureId_fkey" FOREIGN KEY ("aventureId") REFERENCES "Aventure" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AventureSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "aventureId" INTEGER NOT NULL,
    "dateDebut" DATETIME NOT NULL,
    "dateFin" DATETIME NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'OUVERT',
    "placesTotales" INTEGER NOT NULL,
    "placesReservees" INTEGER NOT NULL DEFAULT 0,
    "prixSpecifique" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AventureSession_aventureId_fkey" FOREIGN KEY ("aventureId") REFERENCES "Aventure" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AventureJour" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "aventureId" INTEGER NOT NULL,
    "ordre" INTEGER NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "lieuLabel" TEXT,
    "discipline" TEXT,
    CONSTRAINT "AventureJour_aventureId_fkey" FOREIGN KEY ("aventureId") REFERENCES "Aventure" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sessionId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "participants" INTEGER NOT NULL DEFAULT 1,
    "montant" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Booking_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AventureSession" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "User_facebookId_key" ON "User"("facebookId");

-- CreateIndex
CREATE UNIQUE INDEX "GuideProfile_userId_key" ON "GuideProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Aventure_slug_key" ON "Aventure"("slug");

-- CreateIndex
CREATE INDEX "AventureImage_aventureId_idx" ON "AventureImage"("aventureId");

-- CreateIndex
CREATE INDEX "AventureJour_aventureId_idx" ON "AventureJour"("aventureId");

-- CreateIndex
CREATE UNIQUE INDEX "AventureJour_aventureId_ordre_key" ON "AventureJour"("aventureId", "ordre");
