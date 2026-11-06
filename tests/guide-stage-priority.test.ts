import assert from 'node:assert/strict'
import { test } from 'node:test'
import { computed, effectScope, ref, watch } from 'vue'

test('au chargement, le tirage aléatoire privilégie toujours les moniteurs ayant un prochain stage', async t => {
  Object.assign(globalThis, { computed, watch, useState: (_key: string, init: () => unknown) => ref(init()) })
  const { usePrioritizedRandomMoniteurs } = await import('../app/composables/usePrioritizedRandomMoniteurs')
  const input = ref([
    { id: 1, upcomingStageCount: 0 },
    { id: 2, upcomingStageCount: 1 },
    { id: 3, nextStage: { dateDebut: '2030-06-01T08:00:00Z' } },
    { id: 4, upcomingStageCount: 0 },
  ])
  const orders: number[][] = []
  for (const random of [0, 0.99]) {
    const mock = t.mock.method(Math, 'random', () => random)
    const scope = effectScope()
    const ids = scope.run(() => usePrioritizedRandomMoniteurs(input, 'test-guide-priority').value.map(guide => guide.id))!
    assert.deepEqual([...ids.slice(0, 2)].sort(), [2, 3])
    assert.deepEqual([...ids].sort(), [1, 2, 3, 4])
    orders.push(ids)
    scope.stop()
    mock.mock.restore()
  }
  assert.notDeepEqual(orders[0]?.slice(0, 2), orders[1]?.slice(0, 2))
})

test('le prochain stage utilise la première date encore disponible et son tarif spécifique', async () => {
  let query: any
  const session = (date: string, reserved = 1, price: number | null = null) => ({ dateDebut: new Date(date), dateFin: new Date(date), placesReservees: reserved, prixSpecifique: price })
  const stage = (slug: string, sessions: any[]) => ({
    slug, titre: slug, discipline: 'GRANDE_VOIE', disciplinesComplementaires: [],
    lieuLabel: 'Le Verdon', jours: 2, placesMax: 4, prixParPersonne: 280, devise: 'EUR',
    descriptionCourte: 'Deux jours de grande voie.', niveauMinimum: '5b', sessions,
  })
  const guide = {
    id: 1, firstName: 'Camille', lastName: 'Exemple', department: '38',
    guideProfile: { bio: 'Monitrice.', baseLocation: 'Grenoble', profileImageUrl: '/images/test.jpg' },
    aventures: [
      stage('date-complete-puis-disponible', [session('2030-06-01', 4), session('2030-06-05')]),
      stage('prochain-stage-disponible', [session('2030-06-03', 1, 240)]),
      stage('stage-complet', [session('2030-06-02', 4)]),
    ],
  }
  // Exécuter le vrai handler avec une lecture simulée, sans ouvrir de base.
  Object.assign(globalThis, {
    defineEventHandler: (handler: any) => handler,
    __bdkPrismaState: {
      promise: Promise.resolve({ user: { findMany: async (input: any) => { query = input; return [guide, { ...guide, id: 2, aventures: [] }] } } }),
      mode: null, sqlitePath: null, sqliteFingerprint: null,
    },
  })
  const api = (await import('../server/api/moniteurs/index.get')).default as any
  const { moniteurs } = await api()
  assert.equal(query.include.aventures.where.estPublie, true)
  assert.equal(query.include.aventures.select.sessions.where.statut, 'OUVERT')
  assert.ok(query.include.aventures.select.sessions.where.dateDebut.gte instanceof Date)
  assert.equal(moniteurs[0].upcomingStageCount, 2)
  assert.equal(moniteurs[0].nextStage.slug, 'prochain-stage-disponible')
  assert.equal(moniteurs[0].nextStage.prixParPersonne, 240)
  assert.equal(moniteurs[0].nextStage.lieuLabel, 'Le Verdon')
  assert.equal(moniteurs[0].nextStage.jours, 2)
  assert.equal(moniteurs[0].nextStage.descriptionCourte, 'Deux jours de grande voie.')
  assert.equal(moniteurs[1].upcomingStageCount, 0)
  assert.equal(moniteurs[1].nextStage, null)
})
