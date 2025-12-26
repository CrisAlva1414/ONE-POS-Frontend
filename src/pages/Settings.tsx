import { useEffect, useState } from "react";
import { loadConfig, saveConfig, validateBaseUrl, type AppConfig } from "../services/config";
import { getSalud, getEstado } from "../services/printer";

export default function Settings() {
  const [cfg, setCfg] = useState<AppConfig>(() => loadConfig());
  const [msg, setMsg] = useState<string>("");
  const [err, setErr] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [printerStatus, setPrinterStatus] = useState<any>(null);

  useEffect(() => setErr(""), [cfg.printerBaseUrl]);

  function update<K extends keyof AppConfig>(key: K, val: AppConfig[K]) {
    setCfg(prev => ({ ...prev, [key]: val }));
  }

  async function onSave() {
    const v = validateBaseUrl(cfg.printerBaseUrl);
    if (v) {
      setErr(v);
      return;
    }
    setSaving(true);
    try {
      saveConfig(cfg);
      setMsg("Configuración guardada");
      setTimeout(() => setMsg(""), 2000);
    } finally {
      setSaving(false);
    }
  }

  async function testConnection() {
    setTesting(true);
    setErr("");
    setPrinterStatus(null);
    try {
      const [salud, estado] = await Promise.all([getSalud(), getEstado()]);
      setPrinterStatus({ salud, estado });
      setMsg("✓ Conexión exitosa");
      setTimeout(() => setMsg(""), 3000);
    } catch (e) {
      setErr("Error al conectar: " + (e as Error).message);
    } finally {
      setTesting(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Configuración</h1>
      </div>

      {/* Configuración del servidor de impresión */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-title">Servidor de Impresión</div>
        
        <div className="form-group">
          <label>URL del Servidor</label>
          <input
            className="input"
            placeholder="http://192.168.0.50:8080"
            value={cfg.printerBaseUrl}
            onChange={e => update("printerBaseUrl", e.target.value)}
          />
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 8 }}>
            URL base del servidor FastAPI de impresión (sin slash al final)
          </div>
        </div>

        {err && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            {err}
          </div>
        )}

        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn btn-primary" onClick={onSave} disabled={saving}>
            {saving ? <span className="loader" /> : "💾 Guardar"}
          </button>
          <button className="btn" onClick={testConnection} disabled={testing}>
            {testing ? <span className="loader" /> : "🔌 Probar Conexión"}
          </button>
          {msg && <span className="badge badge-ok">{msg}</span>}
        </div>
      </div>

      {/* Estado de la impresora */}
      {printerStatus && (
        <div className="card">
          <div className="card-title">Estado del Servidor</div>
          
          <div className="grid-2">
            <div>
              <h4 style={{ marginBottom: 12, color: "var(--muted)" }}>Salud del Sistema</h4>
              <div className="form-row">
                <span className="form-label">Estado:</span>
                <span className={printerStatus.salud.ok ? "badge badge-ok" : "badge badge-error"}>
                  {printerStatus.salud.ok ? "✓ OK" : "✗ Error"}
                </span>
              </div>
              <div className="form-row">
                <span className="form-label">IP Local:</span>
                <span>{printerStatus.salud.ip_local}</span>
              </div>
              <div className="form-row">
                <span className="form-label">Cola Pendientes:</span>
                <span>{printerStatus.salud.cola_pendientes}</span>
              </div>
              <div className="form-row">
                <span className="form-label">Últimos Impresos:</span>
                <span>{printerStatus.salud.ultimos_impresos}</span>
              </div>
            </div>

            <div>
              <h4 style={{ marginBottom: 12, color: "var(--muted)" }}>Impresora</h4>
              <div className="form-row">
                <span className="form-label">Disponible:</span>
                <span className={printerStatus.salud.impresora_disponible ? "badge badge-ok" : "badge badge-error"}>
                  {printerStatus.salud.impresora_disponible ? "✓ Sí" : "✗ No"}
                </span>
              </div>
              {printerStatus.salud.impresora_nombre && (
                <div className="form-row">
                  <span className="form-label">Nombre:</span>
                  <span>{printerStatus.salud.impresora_nombre}</span>
                </div>
              )}
              <div className="form-row">
                <span className="form-label">Interfaz:</span>
                <span>{printerStatus.estado.impresora.interfaz}</span>
              </div>
              <div className="form-row">
                <span className="form-label">Ancho Papel:</span>
                <span>{printerStatus.estado.impresora.paper_width_px}px</span>
              </div>
              {printerStatus.salud.error && (
                <div className="alert alert-error" style={{ marginTop: 12 }}>
                  {printerStatus.salud.error}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Información del sistema */}
      <div className="card">
        <div className="card-title">Acerca de</div>
        <p style={{ color: "var(--muted)", lineHeight: 1.6, wordWrap: "break-word" }}>
          <strong style={{ color: "var(--text)" }}>ERP Q-Cube Demo</strong><br />
          Sistema de demostración para impresoras térmicas Q-Cube.<br />
          Versión 1.0.0
        </p>
        <div style={{ marginTop: 20 }}>
          <h4 style={{ marginBottom: 12, color: "var(--muted)" }}>Funcionalidades</h4>
          <ul style={{ color: "var(--muted)", lineHeight: 1.8, paddingLeft: 20 }}>
            <li>✓ Gestión de inventario con alertas de stock</li>
            <li>✓ Órdenes de despacho con picking y control de faltantes</li>
            <li>✓ Impresión automática de tickets térmicos</li>
            <li>✓ Gestión de clientes</li>
            <li>✓ Historial de movimientos de inventario</li>
            <li>✓ Monitoreo de cola de impresión</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
