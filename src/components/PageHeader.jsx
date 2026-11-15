export function PageHeader({ title, description, badge, action }) {
  return (
    <div className="mb-3.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="mt-0.5 text-sm text-slate-600">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

