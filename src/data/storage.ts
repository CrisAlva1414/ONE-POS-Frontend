// Helper sencillo para persistir datos en localStorage como JSON legible
// Mantener claridad: no optimizado, sólo didáctico

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJSON<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value, null, 2));
  } catch {
    // En aulas, ignorar errores de quota
  }
}
