# Salon de l’Escalade 2027

## Visuel officiel

Affiche et logo fournis dans le [kit partenaire et exposant](https://desert-chive-a38.notion.site/Kit-partenaire-officiel-exposant-Salon-de-l-Escalade-2027-406bdd41d9ec802ba4eae7dee42a6a9a), fichiers `affiche-salon-escalade-2027.jpg` et `logo-salon-escalade-neon-edition7.png`.

Réalisation : © Markhor Design. Photographie : © Émilie Fontaine (crédits présents sur l’affiche).
Les versions WebP dans `public/images/salon-escalade-2027/` sont redimensionnées sans recadrage ; le visuel et ses crédits sont conservés.

## Offre

20 % de réduction pour les inscriptions à un stage créées du 15 janvier 2027 à 00 h au 17 janvier à 23 h 59 min 59 s, heure de Paris. La date du stage n’est pas un critère. Aucun code promotionnel.

L’encart est visible avant et pendant le Salon, puis disparaît automatiquement. Le bouton vers les stages adapte son texte pendant l’offre.

Les API de réservations moniteur et administration identifient l’avantage à partir de `Booking.createdAt`, horodatage conservé en base et non éditable dans l’administration. La mention reste disponible après l’événement. Une inscription antérieure ne devient pas éligible lorsqu’on la consulte ou la modifie pendant le Salon. Une réinscription après annulation crée une nouvelle réservation, avec son propre horodatage.

La remise est signalée pour le règlement par le moniteur ; le montant enregistré n’est pas modifié automatiquement.

Vérification de la période : `node --import tsx --test tests/salon-escalade-offer.test.ts`.
