
export function PageHeader({
  title,
  description,
  badge,
  action,
  kicker = 'SesuaiDompet',
}) {
  return (
    <div className="sd-page-heading">
      <div className="sd-page-heading-copy">
        {kicker && (
          <div className="sd-page-kicker">
            {kicker}
          </div>
        )}

        <div className="sd-page-title-row">
          <h1 className="sd-page-title">
            {title}
          </h1>

          {badge}
        </div>

        {description && (
          <p className="sd-page-description">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className="sd-page-heading-action">
          {action}
        </div>
      )}
    </div>
  );
}
