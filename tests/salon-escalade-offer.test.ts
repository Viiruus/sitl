import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getSalonBookingOffer, getSalonOfferPhase } from '../shared/utils/salon-escalade-offer'

test('la remise couvre exactement les 15, 16 et 17 janvier 2027 en heure de Paris', () => {
  for (const date of ['2027-01-15T00:00:00+01:00', '2027-01-16T12:00:00+01:00', '2027-01-17T23:59:59.999+01:00']) {
    assert.equal(getSalonBookingOffer(date)?.discountPercent, 20)
    assert.equal(getSalonOfferPhase(date), 'active')
  }
  assert.equal(getSalonBookingOffer('2027-01-14T23:59:59.999+01:00'), null)
  assert.equal(getSalonOfferPhase('2027-01-14T23:59:59.999+01:00'), 'upcoming')
  assert.equal(getSalonBookingOffer('2027-01-18T00:00:00+01:00'), null)
  assert.equal(getSalonOfferPhase('2027-01-18T00:00:00+01:00'), 'ended')
})

test('la réservation conserve sa remise après le Salon, quelle que soit la date de consultation', t => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2028-06-01T12:00:00Z') })
  assert.equal(getSalonOfferPhase(Date.now()), 'ended')
  assert.deepEqual(getSalonBookingOffer(new Date('2027-01-15T10:00:00Z')), {
    label: 'Salon de l’Escalade 2027', discountPercent: 20,
  })
  // Une réservation antérieure n'est pas rendue éligible par une consultation pendant le Salon.
  t.mock.timers.setTime(new Date('2027-01-16T12:00:00Z').getTime())
  assert.equal(getSalonBookingOffer('2026-11-06T12:00:00Z'), null)
})

test('une date invalide ne déclenche jamais de remise ni une campagne active', () => {
  assert.equal(getSalonBookingOffer('date invalide'), null)
  assert.equal(getSalonOfferPhase('date invalide'), 'ended')
})
