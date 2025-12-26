import type { MovimientoInventario, SKU } from "../models/types";
import { useState } from "react";

export default function Movimientos({
  movimientos,
  inventario,
  setMovimientos,
  setInventario,
}: {
  movimientos: MovimientoInventario[];
  inventario: SKU[];
  setMovimientos: (m: MovimientoInventario[] | ((prev: MovimientoInventario[]) => MovimientoInventario[])) => void;
  setInventario: (i: SKU[] | ((prev: SKU[]) => SKU[])) => void;
}) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevo, setNuevo] = useState<Partial<MovimientoInventario>>({
    tipo: "ENTRADA",
    cantidad: 0,
    razon: "",
    sku: inventario[0]?.sku || "",
  });

  function registrarMovimiento() {
    if (!nuevo.sku || !nuevo.cantidad || nuevo.cantidad === 0) {
      alert("Complete todos los campos");
      return;
    }

    const movimiento: MovimientoInventario = {
      id: `MOV-${Date.now()}`,
      fecha: Date.now(),
      tipo: nuevo.tipo as "ENTRADA" | "SALIDA" | "AJUSTE",
      sku: nuevo.sku,
      cantidad: nuevo.cantidad,
      razon: nuevo.razon || "",
    };

    setMovimientos(prev => [movimiento, ...prev]);

    // Actualizar inventario
    setInventario(prev =>
      prev.map(s => {
        if (s.sku === nuevo.sku) {
          let nuevoStock = s.stock;
          if (nuevo.tipo === "ENTRADA") {
            nuevoStock += nuevo.cantidad!;
          } else if (nuevo.tipo === "SALIDA") {
            nuevoStock -= nuevo.cantidad!;
          } else {
            // AJUSTE
            nuevoStock = nuevo.cantidad!;
          }
          return { ...s, stock: Math.max(0, nuevoStock) };
        }
        return s;
      })
    );

    setMostrarFormulario(false);
    setNuevo({
      tipo: "ENTRADA",
      cantidad: 0,
      razon: "",
      sku: inventario[0]?.sku || "",
    });
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Movimientos de Inventario</h1>
        <div className="page-actions">
          <button
            className="btn btn-primary"
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
          >
            ➕ Nuevo Movimiento
          </button>
        </div>
      </div>

      {mostrarFormulario && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-title">Registrar Movimiento</div>
          <div className="form-group">
            <label>Tipo de Movimiento</label>
            <select
              className="input"
              value={nuevo.tipo}
              onChange={e =>
                setNuevo({ ...nuevo, tipo: e.target.value as any })
              }
            >
              <option value="ENTRADA">Entrada (Compra/Devolución)</option>
              <option value="SALIDA">Salida (Venta/Pérdida)</option>
              <option value="AJUSTE">Ajuste de Inventario</option>
            </select>
          </div>
          <div className="form-group">
            <label>SKU</label>
            <select
              className="input"
              value={nuevo.sku}
              onChange={e => setNuevo({ ...nuevo, sku: e.target.value })}
            >
              {inventario.map(s => (
                <option key={s.sku} value={s.sku}>
                  {s.sku} - {s.nombre} (Stock actual: {s.stock})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>
              Cantidad{" "}
              {nuevo.tipo === "AJUSTE" ? "(Nuevo stock total)" : ""}
            </label>
            <input
              className="input"
              type="number"
              min="0"
              value={nuevo.cantidad}
              onChange={e =>
                setNuevo({ ...nuevo, cantidad: Number(e.target.value) })
              }
            />
          </div>
          <div className="form-group">
            <label>Razón/Comentario</label>
            <input
              className="input"
              value={nuevo.razon}
              onChange={e => setNuevo({ ...nuevo, razon: e.target.value })}
              placeholder="Ej: Compra a proveedor, devolución, etc."
            />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn btn-primary" onClick={registrarMovimiento}>
              Registrar
            </button>
            <button className="btn" onClick={() => setMostrarFormulario(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-title">Historial de Movimientos</div>
        {movimientos.length === 0 ? (
          <div className="empty">No hay movimientos registrados</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>SKU</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Razón</th>
                <th>Orden</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map(m => {
                const sku = inventario.find(s => s.sku === m.sku);
                return (
                  <tr key={m.id}>
                    <td>{new Date(m.fecha).toLocaleString()}</td>
                    <td>
                      <span
                        className={`state ${
                          m.tipo === "ENTRADA"
                            ? "state-DESPACHADA"
                            : m.tipo === "SALIDA"
                            ? "state-FALTANTE"
                            : "state-PREPARACION"
                        }`}
                      >
                        {m.tipo}
                      </span>
                    </td>
                    <td>
                      <strong>{m.sku}</strong>
                    </td>
                    <td>{sku?.nombre || "-"}</td>
                    <td>
                      {m.tipo === "ENTRADA" ? "+" : m.tipo === "SALIDA" ? "-" : "="}
                      {m.cantidad}
                    </td>
                    <td>{m.razon}</td>
                    <td>{m.ordenId || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
