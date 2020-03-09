export const COMPARISON_SYMBOLS = [
  "==", "!=", ">", ">=", "<", "<=",
];

export const COMPARISON_FORM = COMPARISON_SYMBOLS.map((symbol) => ({
  name: symbol,
  value: symbol,
}));

export function validateComparison(test: number, symbol: string, compare: number): boolean {
  switch (symbol) {
    case '==': return test == compare;
    case '!=': return test != compare;
    case '>': return test > compare;
    case '>=': return test >= compare;
    case '<': return test < compare;
    case '<=': return test <= compare;
  }

  throw new Error('Invalid comparison symbol');
};
