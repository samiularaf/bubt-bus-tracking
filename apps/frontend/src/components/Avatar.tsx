interface AvatarProps {
  name: string;
  size?: number;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const initials =
    parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0]?.[0] ?? '?');
  return initials.toUpperCase();
}

export function Avatar({ name, size = 44 }: AvatarProps) {
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      className="rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center shrink-0"
    >
      {getInitials(name)}
    </div>
  );
}
