function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

describe("getDaysInMonth", () => {
  it("should return 31 for January", () => {
    expect(getDaysInMonth(2025, 0)).toBe(31); // Jan 2025
  });

  it("should return 28 for February in non-leap year", () => {
    expect(getDaysInMonth(2025, 1)).toBe(28); // Feb 2025 (non-leap)
  });

  it("should return 29 for February in leap year", () => {
    expect(getDaysInMonth(2024, 1)).toBe(29); // Feb 2024 (leap)
  });

  it("should return 30 for April", () => {
    expect(getDaysInMonth(2025, 3)).toBe(30); // Apr 2025
  });

  it("should return 31 for December", () => {
    expect(getDaysInMonth(2025, 11)).toBe(31); // Dec 2025
  });
});

describe("getFirstDayOfMonth", () => {
  it("should return 0 (Sunday) for June 1, 2025", () => {
    expect(getFirstDayOfMonth(2025, 5)).toBe(0); // June 2025
  });

  it("should return 5 (Friday) for August 1, 2025", () => {
    expect(getFirstDayOfMonth(2025, 7)).toBe(5); // Aug 2025
  });

  it("should return 3 (Wednesday) for January 1, 2025", () => {
    expect(getFirstDayOfMonth(2025, 0)).toBe(3); // Jan 2025
  });
});
