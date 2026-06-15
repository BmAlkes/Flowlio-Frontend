/**
 * Aurora — animated gradient overlay using the Flowlio blue/indigo/cyan palette.
 * Place it as the first child inside a `relative overflow-hidden` container.
 */
export function Aurora({ opacity = 1 }: { opacity?: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden"
      style={{ opacity }}
    >
      {/* Layer 1 — blue, top-right */}
      <div
        className="absolute -inset-10"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 75% 20%, rgba(59,130,246,0.38) 0%, transparent 70%)",
          animation: "aurora-1 14s ease-in-out infinite",
        }}
      />
      {/* Layer 2 — indigo, bottom-left */}
      <div
        className="absolute -inset-10"
        style={{
          background:
            "radial-gradient(ellipse 55% 65% at 20% 75%, rgba(99,102,241,0.32) 0%, transparent 70%)",
          animation: "aurora-2 18s ease-in-out infinite",
        }}
      />
      {/* Layer 3 — cyan, centre-right */}
      <div
        className="absolute -inset-10"
        style={{
          background:
            "radial-gradient(ellipse 45% 50% at 80% 65%, rgba(34,211,238,0.22) 0%, transparent 70%)",
          animation: "aurora-3 11s ease-in-out infinite",
        }}
      />
    </div>
  );
}
