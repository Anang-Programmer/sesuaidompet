export function SourceBadge({ ownerId, currentUserId }) {
  if (ownerId === null || ownerId === undefined) {
    return null;
  }

  const isMine = ownerId === currentUserId;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-extrabold ${
        isMine
          ? 'border border-[#d1ead6] bg-[#eaf6ec] text-[#287744]'
          : 'border border-[#dbe8f3] bg-[#eef5fb] text-[#47749a]'
      }`}
    >
      {isMine ? 'Input Saya' : 'Input User'}
    </span>
  );
}


export function SpecStatusBadge({ complete }) {
  return complete ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#d1ead6] bg-[#eaf6ec] px-2.5 py-1 text-[9px] font-extrabold text-[#287744]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#43a963]" />
      Lengkap
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#f0e2c5] bg-[#fff8e9] px-2.5 py-1 text-[9px] font-extrabold text-[#a47732]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#d7a348]" />
      Belum Dinilai
    </span>
  );
}
