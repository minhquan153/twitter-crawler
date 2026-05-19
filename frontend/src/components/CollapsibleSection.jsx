import { useState } from "react";

function CollapsibleSection({
  title,
  summary,
  actions,
  children,
  defaultOpen = false,
  className = "",
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={`collapsible-section ${className}`}>
      <div className="collapsible-header">
        <button
          className="collapsible-toggle"
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          <span className={`chevron ${open ? "open" : ""}`}>›</span>
          <span className="collapsible-title">{title}</span>
          {summary && <span className="collapsible-summary">{summary}</span>}
        </button>

        {actions && <div className="collapsible-actions">{actions}</div>}
      </div>

      {open && <div className="collapsible-content">{children}</div>}
    </section>
  );
}

export default CollapsibleSection;
