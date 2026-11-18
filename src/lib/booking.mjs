export function rentalDays(start, end) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end))
    return 0;
  const a = new Date(start + "T12:00:00Z"),
    b = new Date(end + "T12:00:00Z");
  if (
    !Number.isFinite(+a) ||
    !Number.isFinite(+b) ||
    a.toISOString().slice(0, 10) !== start ||
    b.toISOString().slice(0, 10) !== end
  )
    return 0;
  const days = (+b - +a) / 86400000;
  return Number.isInteger(days) && days > 0 && days <= 90 ? days : 0;
}
export function quote(price, days, insurance) {
  return days * (price + (insurance ? 19 : 0));
}
export function rentalPeriodDays(
  start,
  end,
  startTime = "10:00",
  endTime = "10:00",
) {
  const days = rentalDays(start, end);
  const validTime = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!days || !validTime.test(startTime) || !validTime.test(endTime)) return 0;
  const billedDays = days + (endTime > startTime ? 1 : 0);
  return billedDays <= 90 ? billedDays : 0;
}
