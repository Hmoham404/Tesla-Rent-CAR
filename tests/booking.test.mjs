import test from "node:test";
import assert from "node:assert/strict";
import { rentalDays, rentalPeriodDays, quote } from "../src/lib/booking.mjs";
test("rental spans include DST changes without changing billable days", () => {
  assert.equal(rentalDays("2027-03-27", "2027-03-29"), 2);
});
test("rejects zero, reversed, missing and overly long stays", () => {
  assert.equal(rentalDays("2027-01-01", "2027-01-01"), 0);
  assert.equal(rentalDays("2027-01-02", "2027-01-01"), 0);
  assert.equal(rentalDays("", "2027-01-01"), 0);
  assert.equal(rentalDays("2027-01-01", "2027-05-01"), 0);
});
test("quotes each rental day and optional protection", () => {
  assert.equal(quote(120, 3, false), 360);
  assert.equal(quote(120, 3, true), 417);
});
test("rejects calendar rollover instead of silently changing the dates", () => {
  assert.equal(rentalDays("2027-02-30", "2027-03-05"), 0);
  assert.equal(rentalDays("2027-02-28", "2027-02-30"), 0);
});
test("rental time rounds partial 24-hour periods up consistently", () => {
  assert.equal(
    rentalPeriodDays("2028-04-11", "2028-04-14", "10:00", "10:00"),
    3,
  );
  assert.equal(
    rentalPeriodDays("2028-04-11", "2028-04-14", "10:00", "11:00"),
    4,
  );
  assert.equal(
    rentalPeriodDays("2028-04-11", "2028-04-14", "10:00", "09:00"),
    3,
  );
  assert.equal(
    rentalPeriodDays("2028-04-11", "2028-04-14", "25:00", "10:00"),
    0,
  );
  assert.equal(
    rentalPeriodDays("2027-01-01", "2027-04-01", "10:00", "11:00"),
    0,
  );
});
