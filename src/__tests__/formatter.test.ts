import { centreOnGrid } from "lib/display";

describe("centreOnGrid", () => {
  it("pads with whole columns, putting any odd space on the right", () => {
    // 32 - 8 = 24 -> 12 spaces
    expect(centreOnGrid("WARNINGS")).toBe(`${" ".repeat(12)}WARNINGS`);
    // 32 - 7 = 25 -> 12 spaces (not 12.5)
    expect(centreOnGrid("WARNING")).toBe(`${" ".repeat(12)}WARNING`);
  });

  it("keeps odd and even length lines on a column, unlike text-align: center", () => {
    const [even, odd] = centreOnGrid("ABCD\nABCDE").split("\n");
    expect(even.indexOf("A")).toBe(14);
    expect(odd.indexOf("A")).toBe(13);
    expect(Number.isInteger(even.indexOf("A"))).toBe(true);
  });

  it("centres each line of a multi line block separately", () => {
    expect(centreOnGrid("a\nabc\nabcde", 9)).toBe("    a\n   abc\n  abcde");
  });

  it("doesn't pad lines that are already full width or too long, and leaves blank lines empty", () => {
    const full = "x".repeat(32);
    expect(centreOnGrid(full)).toBe(full);
    expect(centreOnGrid(`${full}y`)).toBe(`${full}y`);
    expect(centreOnGrid("ab\n\nab", 6)).toBe("  ab\n\n  ab");
  });

  it("copes with empty / missing text and trims stray whitespace", () => {
    expect(centreOnGrid("")).toBe("");
    expect(centreOnGrid(undefined)).toBe("");
    expect(centreOnGrid("  ab  ", 6)).toBe("  ab");
  });
});
