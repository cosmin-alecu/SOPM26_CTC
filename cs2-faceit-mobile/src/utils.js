// Funcții de formatare folosite de mai multe pagini

export function formatNumber(value, decimals = 0) {
  if (value === null || value === undefined || value === "") return "—";

  const number = Number(value);
  if (!Number.isFinite(number)) return "—";

  return number.toLocaleString("ro-RO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(value, decimals = 0) {
  const formatted = formatNumber(value, decimals);
  return formatted === "—" ? formatted : `${formatted}%`;
}

export function getFallbackAvatar(nickname = "CS2") {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    nickname
  )}&background=ff168b&color=fff&size=128&bold=true`;
}

// "de_mirage" -> "Mirage"
export function formatMapName(name = "") {
  const clean = String(name).replace(/^de_/, "").replace(/_/g, " ");
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}
