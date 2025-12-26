import type { SKU } from "../models/types";
import { useState } from "react";

export default function Inventory({ 
  inventario, 
  setInventario,
  onImprimirInventario 
}: { 
  inventario: SKU[]; 
  setInventario: (s: SKU[] | ((prev: SKU[]) => SKU[])) => void;
  onImprimirInventario?: () => void;
}) {
  const [filtro, setFiltro] = useState("");
  const [soloStockBajo, setSoloStockBajo] = useState(false);

  function agregarSKU() {
    const nuevoSKU: SKU = {
      sku: `SKU-${String(inventario.length + 1).padStart(3, "0")}`,
      nombre: "Nuevo Producto",
      stock: 0,
      ubicacion: "A1",
      categoria: "General",
      precio: 0,
      stockMinimo: 5,
    };
    setInventario(prev => [nuevoSKU, ...prev]);
  }

  function eliminarSKU(sku: string) {
    if (confirm(`¿Eliminar ${sku}?`)) {
      setInventario(prev => prev.filter(s => s.sku !== sku));
    }
  }

  // Filtrar inventario
  const inventarioFiltrado = inventario.filter(s => {
    const coincideFiltro = !filtro || 
      s.sku.toLowerCase().includes(filtro.toLowerCase()) ||
      s.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      (s.categoria || "").toLowerCase().includes(filtro.toLowerCase());
    
    const cumpleStockBajo = !soloStockBajo || s.stock < (s.stockMinimo || 5);
    
    return coincideFiltro && cumpleStockBajo;
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Inventario</h1>
        <div className="page-actions">
          {onImprimirInventario && (
            <button className="btn" onClick={onImprimirInventario}>
              🖨️ Imprimir Inventario
            </button>
          )}
          <button className="btn btn-primary" onClick={agregarSKU}>
            ➕ Agregar SKU
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 250 }}>
            <input
              className="input"
              placeholder="🔍 Buscar por SKU, nombre o categoría..."
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
            />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={soloStockBajo}
              onChange={e => setSoloStockBajo(e.target.checked)}
            />
            <span>Solo stock bajo</span>
          </label>
          <div style={{ color: "var(--muted)", fontSize: 14 }}>
            {inventarioFiltrado.length} de {inventario.length} productos
          </div>
        </div>
      </div>

      {/* Tabla de inventario */}
      <div className="card">
        <div className="card-title">Productos</div>
        {inventarioFiltrado.length === 0 ? (
          <div className="empty">No hay productos que coincidan con los filtros</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Stock</th>
                <th>Stock Mín.</th>
                <th>Precio</th>
                <th>Ubicación</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {inventarioFiltrado.map((s, i) => {
                const stockBajo = s.stock < (s.stockMinimo || 5);
                return (
                  <tr key={s.sku + "-" + i}>
                    <td>
                      <input
                        className="input input-sm"
                        value={s.sku}
                        onChange={e =>
                          setInventario(inv =>
                            inv.map((x, idx) =>
                              idx === i ? { ...x, sku: e.target.value } : x
                            )
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="input input-sm"
                        value={s.nombre}
                        onChange={e =>
                          setInventario(inv =>
                            inv.map((x, idx) =>
                              idx === i ? { ...x, nombre: e.target.value } : x
                            )
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="input input-sm"
                        value={s.categoria || ""}
                        onChange={e =>
                          setInventario(inv =>
                            inv.map((x, idx) =>
                              idx === i ? { ...x, categoria: e.target.value } : x
                            )
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="input input-sm"
                        type="number"
                        value={s.stock}
                        onChange={e =>
                          setInventario(inv =>
                            inv.map((x, idx) =>
                              idx === i ? { ...x, stock: Number(e.target.value) } : x
                            )
                          )
                        }
                        style={{ 
                          color: stockBajo ? "var(--danger)" : "inherit",
                          fontWeight: stockBajo ? "bold" : "normal"
                        }}
                      />
                    </td>
                    <td>
                      <input
                        className="input input-sm"
                        type="number"
                        value={s.stockMinimo || 5}
                        onChange={e =>
                          setInventario(inv =>
                            inv.map((x, idx) =>
                              idx === i ? { ...x, stockMinimo: Number(e.target.value) } : x
                            )
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="input input-sm"
                        type="number"
                        step="0.01"
                        value={s.precio || 0}
                        onChange={e =>
                          setInventario(inv =>
                            inv.map((x, idx) =>
                              idx === i ? { ...x, precio: Number(e.target.value) } : x
                            )
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="input input-sm"
                        value={s.ubicacion}
                        onChange={e =>
                          setInventario(inv =>
                            inv.map((x, idx) =>
                              idx === i ? { ...x, ubicacion: e.target.value } : x
                            )
                          )
                        }
                      />
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => eliminarSKU(s.sku)}
                      >
                        🗑️
                      </button>
                    </td>
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
