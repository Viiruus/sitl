import assert from 'node:assert/strict'
import test from 'node:test'
import { escaladeDepartmentEntries } from '../shared/data/escalade-departments'
import { departmentHubPath, guideServesDepartment, stageIsLocatedInDepartment } from '../shared/utils/seo-hubs'

const guideDepartments = (guide: Parameters<typeof guideServesDepartment>[0]) =>
  escaladeDepartmentEntries
    .filter(([code]) => guideServesDepartment(guide, code))
    .map(([code]) => code)
    .sort()

test('Anaïs gets links to the four existing Pyrenean department pages', () => {
  assert.deepEqual(guideDepartments({
    department: null,
    baseLocation: 'Pyrénées et région Occitanie',
    serviceAreas: null,
  }), ['09', '31', '64', '65'])
})

test('shared massifs resolve to several departments, including combined labels', () => {
  assert.deepEqual(guideDepartments({ baseLocation: 'Massif des Bauges & Vercors' }), ['26', '38', '73', '74'])
  assert.deepEqual(guideDepartments({ baseLocation: 'Chartreuse et Belledonne' }), ['38', '73'])
})

test('massif detection tolerates accents, case and whitespace', () => {
  assert.deepEqual(guideDepartments({ baseLocation: '  MASSIF DES ECRINS  ' }), ['05', '38'])
  assert.deepEqual(guideDepartments({ baseLocation: 'Pyre\u0301ne\u0301es' }), ['09', '31', '64', '65'])
  assert.deepEqual(guideDepartments({ baseLocation: 'Sud Cévennes' }), ['07', '30', '34', '48'])
})

test('precise locations take precedence over wider massifs', () => {
  assert.deepEqual(guideDepartments({ baseLocation: 'Massif des Bauges (Savoie)' }), ['73'])
  assert.deepEqual(guideDepartments({ baseLocation: 'Bauges (74)' }), ['74'])
  assert.deepEqual(guideDepartments({ baseLocation: 'Presles, Vercors' }), ['38'])
  assert.deepEqual(guideDepartments({ baseLocation: 'Alpes (Briançon)' }), ['05'])
  assert.deepEqual(guideDepartments({ baseLocation: 'Pyrénées - Pays Basque - Espagne' }), ['64'])
})

test('department names containing massif names do not expand to the massif', () => {
  assert.deepEqual(guideDepartments({ baseLocation: 'Pyrénées-Atlantiques' }), ['64'])
  assert.deepEqual(guideDepartments({ baseLocation: 'Hautes-Pyrénées/Savoie' }), ['65', '73'])
  assert.deepEqual(guideDepartments({ baseLocation: 'Alpes-de-Haute-Provence' }), ['04'])
  assert.deepEqual(guideDepartments({ baseLocation: 'Hautes-Alpes' }), ['05'])
  assert.deepEqual(guideDepartments({ baseLocation: 'Pyrénées-Orientales' }), [])
  assert.deepEqual(guideDepartments({ baseLocation: 'Alpes-Maritimes' }), [])
  assert.deepEqual(guideDepartments({ baseLocation: 'Pyrénées (66)' }), [])
})

test('service areas also resolve massifs independently of the home department', () => {
  assert.deepEqual(guideDepartments({
    department: '33 - Gironde',
    baseLocation: 'Bordeaux',
    serviceAreas: ['Pyrénées', 'Écrins', null, 42],
  }), ['05', '09', '31', '33', '38', '64', '65'])
})

test('empty, invalid, unknown or partial labels do not create matches', () => {
  for (const baseLocation of [undefined, null, '', 'Occitanie', 'Planète terre', 'Baugesville', 'Vercorsien']) {
    assert.deepEqual(guideDepartments({ baseLocation }), [])
  }
  assert.deepEqual(guideDepartments({ serviceAreas: 'Pyrénées' }), [])
})

test('existing cities, local sectors and explicit departments keep working', () => {
  assert.deepEqual(guideDepartments({ baseLocation: 'Grenoble et ses alentours' }), ['38'])
  assert.deepEqual(guideDepartments({ baseLocation: 'Gorges du Verdon' }), ['04'])
  assert.deepEqual(guideDepartments({ department: '73 - Savoie' }), ['73'])
})

test('massif coverage never places an undecided stage in several departments', () => {
  for (const lieuLabel of ['Pyrénées', 'Massif des Bauges', 'Vercors', 'Écrins']) {
    assert.deepEqual(escaladeDepartmentEntries.filter(([code]) => stageIsLocatedInDepartment({ lieuLabel }, code)), [])
  }
  assert.equal(stageIsLocatedInDepartment({ lieuLabel: 'Bauges (Savoie)' }, '73'), true)
  assert.equal(stageIsLocatedInDepartment({ lieuLabel: 'Bauges (Savoie)' }, '74'), false)
  assert.equal(stageIsLocatedInDepartment({ lieuLabel: 'Presles, Vercors' }, '38'), true)
  assert.equal(stageIsLocatedInDepartment({ lieuLabel: 'Presles, Vercors' }, '26'), false)
  assert.equal(departmentHubPath('64 - Pyrénées-Atlantiques'), '/escalade/pyrenees-atlantiques')
})
