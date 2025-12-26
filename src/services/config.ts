// Configuración centralizada del frontend
// Guarda y carga la URL base del servidor de impresión
// No modificar lógica de negocio; sólo configuración de entorno

const K_CFG = "erp_config";

export type AppConfig = {
  printerBaseUrl: string; // e.g. http://192.168.0.50:8080
};

const DEFAULT_CONFIG: AppConfig = {
  printerBaseUrl: "http://localhost:8080", // valor inicial, editable por UI
};

export function loadConfig(): AppConfig {
  try {
    const raw = localStorage.getItem(K_CFG);
    if (!raw) return DEFAULT_CONFIG;
    const data = JSON.parse(raw) as AppConfig;
    return { ...DEFAULT_CONFIG, ...data };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(cfg: AppConfig) {
  localStorage.setItem(K_CFG, JSON.stringify(cfg, null, 2));
}

export function validateBaseUrl(url: string): string | null {
  if (!url) return "La URL no puede estar vacía";
  try {
    const u = new URL(url);
    if (!/^https?:$/.test(u.protocol)) return "La URL debe usar http o https";
    return null;
  } catch {
    return "URL inválida";
  }
}
