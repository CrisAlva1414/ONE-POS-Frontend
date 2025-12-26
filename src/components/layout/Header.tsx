import "./layout.css";
import { useEffect, useState } from "react";
import { getSalud } from "../../services/printer";

type SaludResponse = {
  ok: boolean;
  impresora_disponible: boolean;
  impresora_nombre?: string;
  cola_pendientes: number;
  error?: string;
};

export function Header({ title, status }: { title: string; status: string }) {
  const [loading, setLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState(status);
  const [saludData, setSaludData] = useState<SaludResponse | null>(null);

  useEffect(() => {
    setLocalStatus(status);
  }, [status]);

  useEffect(() => {
    // Verificar estado cada 5 segundos
    const checkStatus = async () => {
      try {
        const data = await getSalud();
        setSaludData(data);
        if (data.impresora_disponible) {
          setLocalStatus("OK");
        } else {
          setLocalStatus("sin impresora");
        }
      } catch {
        setLocalStatus("sin conexión");
        setSaludData(null);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  async function checkStatusManual() {
    setLoading(true);
    try {
      const data = await getSalud();
      setSaludData(data);
      if (data.impresora_disponible) {
        setLocalStatus("OK");
      } else {
        setLocalStatus("sin impresora");
      }
    } catch {
      setLocalStatus("sin conexión");
      setSaludData(null);
    } finally {
      setLoading(false);
    }
  }

  const badgeClass =
    localStatus === "OK" 
      ? "badge badge-ok" 
      : localStatus === "sin impresora"
      ? "badge badge-warning"
      : "badge badge-error";

  return (
    <header className="header">
      <div className="header-title">{title}</div>
      <div className="header-actions">
        {saludData?.impresora_nombre && (
          <span style={{ color: "var(--muted)", fontSize: 14 }}>
            🖨️ {saludData.impresora_nombre}
          </span>
        )}
        {saludData?.cola_pendientes !== undefined && saludData.cola_pendientes > 0 && (
          <span className="badge badge-warning" style={{ fontSize: 13 }}>
            {saludData.cola_pendientes} en cola
          </span>
        )}
        <span
          className={badgeClass}
          title="Estado del servidor de impresión - Click para actualizar"
          style={{ cursor: "pointer" }}
          onClick={checkStatusManual}
        >
          {localStatus === "OK" 
            ? "✓ Impresora OK" 
            : localStatus === "sin impresora"
            ? "⚠️ Sin impresora"
            : "✗ Sin conexión"}
        </span>
        {loading && <span className="loader" />}
      </div>
    </header>
  );
}
