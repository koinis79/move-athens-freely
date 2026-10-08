import { describe, it, expect } from "vitest";
import { normalizePhone } from "./phone";

describe("normalizePhone", () => {
  it.each([
    ["+81 90 1234 5678", "+819012345678"], // Japan
    ["+1 (212) 555-0123", "+12125550123"], // US
    ["+44 7700 900123", "+447700900123"], // UK
    ["+30 694 123 4567", "+306941234567"], // Greece mobile
    ["+972 50-123-4567", "+972501234567"], // Israel
    ["+39 312 345 6789", "+393123456789"], // Italy
    ["+49 1512 3456789", "+4915123456789"], // Germany
    ["+33 6 12 34 56 78", "+33612345678"], // France
    ["0081 90 1234 5678", "+819012345678"], // 00 international prefix
    ["  +30-694.123.4567 ", "+306941234567"], // mixed separators
    ["694 123 4567", "+306941234567"], // bare Greek mobile → +30
    ["210 322 3041", "+302103223041"], // bare Greek landline → +30
  ])("accepts %s", (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });

  it.each([
    "+30 123", // too short (5 digits)
    "+81 12", // too short
    "+1234567890123456", // 16 digits — too long
    "7700 900123", // no country code, not a Greek 10-digit number
    "694 123 456", // Greek-looking but only 9 digits
    "6941 234 5678", // Greek-looking but 11 digits
    "123 456 7890", // 10 digits but not a Greek prefix
    "+0 123 456 789", // country codes never start with 0
    "+30 69x 123 4567", // letters
    "",
  ])("rejects %s", (input) => {
    expect(normalizePhone(input)).toBeNull();
  });
});
