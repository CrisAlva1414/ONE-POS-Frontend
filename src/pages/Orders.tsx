import type { Orden, SKU, Cliente } from "../models/types";
import { StateBadge } from "../components/common/StateBadge";
import { useState } from "react";

export default function Orders({ 
  ordenes, 
  inventario, 
  clientes,
  onImprimir, 
  onDespachar,
  onCancelar 
}: {
  ordenes: Orden[];
  inventario: SKU[];
  clientes: Cliente[];
  onImprimir: (tipo: "picking" | "faltantes" | "despacho", orden: Orden) => void;
  onDespachar: (orden: Orden) => void;
  onCancelar?: (orden: Orden) => void;
}) {
  const [filtroEstado, setFiltroEstado] = useState<string>("TODAS");
  const [expandida, setExpandida] = useState<string | null>(null);

  const ordenesFiltradas = filtroEstado === "TODAS" 
    ? ordenes 
    : ordenes.filter(o => o.estado === filtroEstado);

  function toggleExpand(id: string) {
    setExpandida(expandida === id ? null : id);
  }

  function obtenerCliente(clienteId?: string) {
    if (!clienteId) return null;
    return clientes.find(c => c.id === clienteId);
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Órdenes de Despacho</h1>
      </div>

      {/* Filtros */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ color: "var(--muted)", fontWeight: 600 }}>Filtrar por estado:</span>
          {["TODAS", "CREADA", "PREPARACION", "FALTANTE", "DESPACHADA", "CANCELADA"].map(estado => (
            <button
              key={estado}
              className={`btn btn-sm ${filtroEstado === estado ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setFiltroEstado(estado)}
            >
              {estado}
            </button>
          ))}
          <div style={{ marginLeft: "auto", color: "var(--muted)", fontSize: 14 }}>
            {ordenesFiltradas.length} órdenes
          </div>
        </div>
      </div>

      {/* Lista de órdenes */}
      <div className="card">
        <div className="card-title">Lista de Órdenes</div>
        {ordenesFiltradas.length === 0 ? (
          <div className="empty">No hay órdenes {filtroEstado !== "TODAS" && `con estado ${filtroEstado}`}</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th></th>
                <th>ID</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Items</th>
                <th>Notas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenesFiltradas.map(o => {
                const cliente = obtenerCliente(o.clienteId);
                const isExpandida = expandida === o.id;
                return (
                  <>
                    <tr key={o.id}>
                      <td>
                        <button 
                          className="btn btn-ghost btn-sm" 
                          onClick={() => toggleExpand(o.id)}
                        >
                          {isExpandida ? "▼" : "▶"}
                        </button>
                      </td>
                      <td><strong>{o.id}</strong></td>
                      <td>{new Date(o.fecha).toLocaleString()}</td>
                      <td>{cliente?.nombre || "-"}</td>
                      <td><StateBadge estado={o.estado} /></td>
                      <td>{o.items.length} items</td>
                      <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {o.notas || "-"}
                      </td>
                      <td>
                        <div className="row-actions">
                          <button 
                            className="btn btn-sm" 
                            onClick={() => onImprimir("picking", o)}
                            title="Imprimir lista de picking"
                          >
                            📋
                          </button>
                          {o.estado === "FALTANTE" && (
                            <button 
                              className="btn btn-sm" 
                              onClick={() => onImprimir("faltantes", o)}
                              title="Imprimir faltantes"
                            >
                              ⚠️
                            </button>
                          )}
                          {o.estado !== "DESPACHADA" && o.estado !== "CANCELADA" && (
                            <button 
                              className="btn btn-primary btn-sm" 
                              onClick={() => onDespachar(o)}
                              title="Despachar orden"
                            >
                              ✓
                            </button>
                          )}
                          {o.estado === "DESPACHADA" && (
                            <button 
                              className="btn btn-sm" 
                              onClick={() => onImprimir("despacho", o)}
                              title="Imprimir ticket de despacho"
                            >
                              🖨️
                            </button>
                          )}
                          {onCancelar && o.estado !== "DESPACHADA" && o.estado !== "CANCELADA" && (
                            <button 
                              className="btn btn-danger btn-sm" 
                              onClick={() => onCancelar(o)}
                              title="Cancelar orden"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isExpandida && (
                      <tr>
                        <td colSpan={8} style={{ background: "rgba(255,255,255,0.02)" }}>
                          <div style={{ padding: "16px 24px" }}>
                            <h4 style={{ marginBottom: 12, color: "var(--primary)" }}>Detalle de Items</h4>
                            <table className="table">
                              <thead>
                                <tr>
                                  <th>SKU</th>
                                  <th>Producto</th>
                                  <th>Requerido</th>
                                  <th>Stock Disponible</th>
                                  <th>Ubicación</th>
                                  <th>Estado</th>
                                </tr>
                              </thead>
                              <tbody>
                                {o.items.map(it => {
                                  const sku = inventario.find(s => s.sku === it.sku);
                                  const stock = sku ? sku.stock : 0;
                                  const suficiente = stock >= it.requerido;
                                  return (
                                    <tr key={it.sku}>
                                      <td><strong>{it.sku}</strong></td>
                                      <td>{sku?.nombre || "Producto no encontrado"}</td>
                                      <td><strong>{it.requerido}</strong></td>
                                      <td style={{ color: suficiente ? "var(--ok)" : "var(--danger)" }}>
                                        {stock}
                                      </td>
                                      <td>{sku?.ubicacion || "-"}</td>
                                      <td>
                                        {suficiente ? (
                                          <span className="state state-DESPACHADA">✓ OK</span>
                                        ) : (
                                          <span className="state state-FALTANTE">Falta: {it.requerido - stock}</span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                            {o.notas && (
                              <div style={{ marginTop: 16 }}>
                                <strong>Notas:</strong> {o.notas}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
