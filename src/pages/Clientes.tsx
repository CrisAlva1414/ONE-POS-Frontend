import type { Cliente } from "../models/types";
import { useState } from "react";

export default function Clientes({
  clientes,
  setClientes,
}: {
  clientes: Cliente[];
  setClientes: (c: Cliente[] | ((prev: Cliente[]) => Cliente[])) => void;
}) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);

  function agregarCliente() {
    const nuevoCliente: Cliente = {
      id: `CLI-${Date.now()}`,
      nombre: "Nuevo Cliente",
      fechaRegistro: Date.now(),
    };
    setClientes(prev => [nuevoCliente, ...prev]);
    setEditando(nuevoCliente);
    setMostrarFormulario(true);
  }

  function guardarCliente(cliente: Cliente) {
    setClientes(prev =>
      prev.map(c => (c.id === cliente.id ? cliente : c))
    );
    setMostrarFormulario(false);
    setEditando(null);
  }

  function eliminarCliente(id: string) {
    if (confirm("¿Eliminar este cliente?")) {
      setClientes(prev => prev.filter(c => c.id !== id));
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Clientes</h1>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={agregarCliente}>
            ➕ Nuevo Cliente
          </button>
        </div>
      </div>

      {mostrarFormulario && editando && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-title">Editar Cliente</div>
          <div className="form-group">
            <label>Nombre</label>
            <input
              className="input"
              value={editando.nombre}
              onChange={e =>
                setEditando({ ...editando, nombre: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              className="input"
              type="email"
              value={editando.email || ""}
              onChange={e =>
                setEditando({ ...editando, email: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input
              className="input"
              value={editando.telefono || ""}
              onChange={e =>
                setEditando({ ...editando, telefono: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>Dirección</label>
            <input
              className="input"
              value={editando.direccion || ""}
              onChange={e =>
                setEditando({ ...editando, direccion: e.target.value })
              }
            />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              className="btn btn-primary"
              onClick={() => guardarCliente(editando)}
            >
              Guardar
            </button>
            <button
              className="btn"
              onClick={() => {
                setMostrarFormulario(false);
                setEditando(null);
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-title">Lista de Clientes</div>
        {clientes.length === 0 ? (
          <div className="empty">No hay clientes registrados</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th>Fecha Registro</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clientes.map(c => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.id}</strong>
                  </td>
                  <td>{c.nombre}</td>
                  <td>{c.email || "-"}</td>
                  <td>{c.telefono || "-"}</td>
                  <td>{c.direccion || "-"}</td>
                  <td>{new Date(c.fechaRegistro).toLocaleDateString()}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="btn btn-sm"
                        onClick={() => {
                          setEditando(c);
                          setMostrarFormulario(true);
                        }}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => eliminarCliente(c.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
