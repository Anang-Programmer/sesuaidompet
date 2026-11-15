export function SourceBadge({ ownerId, currentUserId }) {
  if (ownerId === null || ownerId === undefined) {
    return null;
  }

  if (ownerId === currentUserId) {
    return (
      <span className="inline-flex items-center rounded-xs bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
        Input Saya
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-xs bg-sky-100 px-2 py-0.5 text-[11px] font-medium text-sky-800">
      Input User
    </span>
  );
}

export function SpecStatusBadge({ complete }) {
  return complete ? (
    <span className="inline-flex items-center rounded-xs bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
      Lengkap
    </span>
  ) : (
    <span className="inline-flex items-center rounded-xs bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">
      Belum Dinilai
    </span>
  );
}

