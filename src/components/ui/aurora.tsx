/**
 * Aurora — animated gradient background using Flowlio's blue/indigo/cyan palette.
 * Wrap the card in `relative overflow-hidden` and place <Aurora /> as first child.
 */
export function Aurora() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden"
    >
      {/* Layer 1 — blue, top-right sweep */}
      <div
        className="absolute -inset-12"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 80% 10%, rgba(59,130,246,0.25) 0%, transparent 65%)",
          animation: "aurora-1 14s ease-in-out infinite",
        }}
      />
      {/* Layer 2 — indigo, bottom-left */}
      <div
        className="absolute -inset-12"
        style={{
          background:
            "radial-gradient(ellipse 60% 70% at 15% 80%, rgba(99,102,241,0.22) 0%, transparent 65%)",
          animation: "aurora-2 18s ease-in-out infinite",
        }}
      />
      {/* Layer 3 — cyan accent, centre */}
      <div
        className="absolute -inset-12"
        style={{
          background:
            "radial-gradient(ellipse 50% 55% at 60% 50%, rgba(34,211,238,0.15) 0%, transparent 65%)",
          animation: "aurora-3 11s ease-in-out infinite",
        }}
      />
    </div>
  );
}
