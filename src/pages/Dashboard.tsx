import type { Orden, SKU, Cliente } from "../models/types";

export default function Dashboard({ 
  ordenes, 
  inventario, 
  clientes,
  onCrearOrden 
}: {
  ordenes: Orden[];
  inventario: SKU[];
  clientes: Cliente[];
  onCrearOrden: () => void;
}) {
  // Cálculos de estadísticas
  const totalOrdenes = ordenes.length;
  const ordenesPendientes = ordenes.filter(o => o.estado !== "DESPACHADA" && o.estado !== "CANCELADA").length;
  const ordenesDespachadas = ordenes.filter(o => o.estado === "DESPACHADA").length;
  const ordenesHoy = ordenes.filter(o => {
    const hoy = new Date();
    const fechaOrden = new Date(o.fecha);
    return fechaOrden.toDateString() === hoy.toDateString();
  }).length;

  const totalSKUs = inventario.length;
  const skusBajoStock = inventario.filter(s => {
    const minimo = s.stockMinimo || 5;
    return s.stock < minimo;
  }).length;
  const valorInventario = inventario.reduce((acc, sku) => acc + (sku.stock * (sku.precio || 0)), 0);

  const totalClientes = clientes.length;

  // Últimas órdenes
  const ultimasOrdenes = [...ordenes].sort((a, b) => b.fecha - a.fecha).slice(0, 5);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={onCrearOrden}>
            ➕ Nueva Orden
          </button>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Órdenes Totales</div>
          <div className="stat-value">{totalOrdenes}</div>
          <div className="stat-change positive">
            ↑ {ordenesHoy} hoy
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Pendientes</div>
          <div className="stat-value">{ordenesPendientes}</div>
          <div className="stat-change">
            {ordenesPendientes > 5 ? "⚠️ Revisar" : "✓ OK"}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Despachadas</div>
          <div className="stat-value">{ordenesDespachadas}</div>
          <div className="stat-change positive">
            {totalOrdenes > 0 ? `${Math.round((ordenesDespachadas / totalOrdenes) * 100)}%` : "0%"} del total
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Inventario SKUs</div>
          <div className="stat-value">{totalSKUs}</div>
          <div className={`stat-change ${skusBajoStock > 0 ? "negative" : "positive"}`}>
            {skusBajoStock > 0 ? `⚠️ ${skusBajoStock} bajo stock` : "✓ Stock OK"}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Valor Inventario</div>
          <div className="stat-value">${valorInventario.toFixed(2)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Clientes</div>
          <div className="stat-value">{totalClientes}</div>
        </div>
      </div>

      {/* Grid de contenido */}
      <div className="grid-2">
        {/* Últimas órdenes */}
        <div className="card">
          <div className="card-title">Últimas Órdenes</div>
          {ultimasOrdenes.length === 0 ? (
            <div className="empty">No hay órdenes registradas</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Estado</th>
                  <th>Items</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {ultimasOrdenes.map(o => (
                  <tr key={o.id}>
                    <td><strong>{o.id}</strong></td>
                    <td><span className={`state state-${o.estado}`}>{o.estado}</span></td>
                    <td>{o.items.length} items</td>
                    <td>{new Date(o.fecha).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Alertas de inventario */}
        <div className="card">
          <div className="card-title">Alertas de Inventario</div>
          {skusBajoStock === 0 ? (
            <div className="alert alert-success">
              ✓ Todos los productos tienen stock suficiente
            </div>
          ) : (
            <>
              <div className="alert alert-warning">
                ⚠️ {skusBajoStock} productos por debajo del stock mínimo
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Producto</th>
                    <th>Stock</th>
                    <th>Mínimo</th>
                  </tr>
                </thead>
                <tbody>
                  {inventario
                    .filter(s => s.stock < (s.stockMinimo || 5))
                    .slice(0, 5)
                    .map(s => (
                      <tr key={s.sku}>
                        <td><strong>{s.sku}</strong></td>
                        <td>{s.nombre}</td>
                        <td style={{ color: 'var(--danger)' }}>{s.stock}</td>
                        <td>{s.stockMinimo || 5}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="card">
        <div className="card-title">Acciones Rápidas</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={onCrearOrden}>
            ➕ Nueva Orden de Despacho
          </button>
        </div>
      </div>
    </div>
  );
}
