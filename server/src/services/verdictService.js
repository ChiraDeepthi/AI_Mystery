export function evaluateVerdict(mystery, suspectId) {
  return suspectId === mystery.solution.culpritId;
}
