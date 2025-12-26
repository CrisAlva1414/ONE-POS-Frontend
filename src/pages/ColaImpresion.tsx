import { useState, useEffect } from "react";
import { getCola } from "../services/printer";

type JobStatus = {
  id: string;
  client_ip: string;
  original_filename: string;
  received_at: number;
  state: string;
  error_message?: string;
};

type ColaResponse = {
  pendientes: JobStatus[];
  impresos: JobStatus[];
};

export default function ColaImpresion() {
  const [cola, setCola] = useState<ColaResponse>({ pendientes: [], impresos: [] });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function cargarCola() {
    try {
      setCargando(true);
      setError(null);
      const data = await getCola();
      setCola(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarCola();
    const interval = setInterval(cargarCola, 3000); // Actualizar cada 3 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Cola de Impresión</h1>
        <div className="page-actions">
          <button className="btn" onClick={cargarCola} disabled={cargando}>
            {cargando ? <span className="loader" /> : "🔄 Actualizar"}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 24 }}>
          ❌ Error al cargar la cola: {error}
        </div>
      )}

      <div className="grid-2">
        {/* Trabajos pendientes */}
        <div className="card">
          <div className="card-title">
            Trabajos Pendientes ({cola.pendientes.length})
          </div>
          {cola.pendientes.length === 0 ? (
            <div className="empty">No hay trabajos pendientes</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Archivo</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {cola.pendientes.map(job => (
                  <tr key={job.id}>
                    <td>
                      <strong>{job.original_filename}</strong>
                    </td>
                    <td>
                      <span className="state state-PREPARACION">{job.state}</span>
                    </td>
                    <td>{new Date(job.received_at * 1000).toLocaleString()}</td>
                    <td>{job.client_ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Trabajos impresos */}
        <div className="card">
          <div className="card-title">
            Últimos Impresos ({cola.impresos.length})
          </div>
          {cola.impresos.length === 0 ? (
            <div className="empty">No hay trabajos impresos</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Archivo</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {cola.impresos.map(job => (
                  <tr key={job.id}>
                    <td>
                      <strong>{job.original_filename}</strong>
                    </td>
                    <td>
                      {job.error_message ? (
                        <span className="state state-FALTANTE">ERROR</span>
                      ) : (
                        <span className="state state-DESPACHADA">{job.state}</span>
                      )}
                    </td>
                    <td>{new Date(job.received_at * 1000).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Información adicional */}
      <div className="card">
        <div className="card-title">Estado del Sistema</div>
        <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
          <div>
            <div className="stat-label">Total Pendientes</div>
            <div className="stat-value" style={{ fontSize: "28px" }}>
              {cola.pendientes.length}
            </div>
          </div>
          <div>
            <div className="stat-label">Total Impresos</div>
            <div className="stat-value" style={{ fontSize: "28px" }}>
              {cola.impresos.length}
            </div>
          </div>
          <div>
            <div className="stat-label">Errores</div>
            <div className="stat-value" style={{ fontSize: "28px", color: "var(--danger)" }}>
              {cola.impresos.filter(j => j.error_message).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
