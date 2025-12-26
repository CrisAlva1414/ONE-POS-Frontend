import "./layout.css";

type Item = { 
  key: string; 
  label: string; 
  icon?: string; 
  section?: string;
};

type Section = {
  name: string;
  items: Item[];
};

export function Sidebar({ items, active, onSelect }: { items: Item[]; active: string; onSelect: (key: string) => void }) {
  // Agrupar items por sección
  const sections: Section[] = [];
  const defaultSection = { name: "", items: [] as Item[] };
  
  items.forEach(item => {
    if (item.section) {
      let section = sections.find(s => s.name === item.section);
      if (!section) {
        section = { name: item.section, items: [] };
        sections.push(section);
      }
      section.items.push(item);
    } else {
      defaultSection.items.push(item);
    }
  });
  
  if (defaultSection.items.length > 0) {
    sections.unshift(defaultSection);
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">ERP Q-Cube</div>
      <nav>
        {sections.map((section, idx) => (
          <div key={idx}>
            {section.name && <div className="sidebar-section">{section.name}</div>}
            {section.items.map(it => (
              <button 
                key={it.key} 
                className={`nav-item ${active === it.key ? "active" : ""}`} 
                onClick={() => onSelect(it.key)}
              >
                {it.icon ? (
                  <span className="nav-icon">{it.icon}</span>
                ) : (
                  <span className="nav-dot" />
                )}
                <span>{it.label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
