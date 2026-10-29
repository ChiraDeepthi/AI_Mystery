// The MVP intentionally uses clearly labeled visual briefs and simulated CCTV.
// A provider can be added here without coupling media generation to case creation.
export function describeMedia(content, type) {
  return { type, status: type === 'cctv' ? 'simulated' : 'placeholder', content };
}
