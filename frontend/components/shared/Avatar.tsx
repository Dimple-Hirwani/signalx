interface AvatarProps {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
}

const COLOURS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-cyan-500",
  "bg-pink-500",
  "bg-indigo-500",
];

function colourFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLOURS[Math.abs(hash) % COLOURS.length] ?? COLOURS[0];
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0]?.[0] ?? "?").toUpperCase();
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

const SIZE = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-12 w-12 text-base" };

export function Avatar({ name, src, size = "md" }: AvatarProps) {
  const cls = `${SIZE[size]} rounded-full flex-shrink-0 flex items-center justify-center font-semibold text-white overflow-hidden`;

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={name} className={`${cls} object-cover`} />
    );
  }

  return (
    <div className={`${cls} ${colourFor(name)}`}>
      {initials(name)}
    </div>
  );
}
