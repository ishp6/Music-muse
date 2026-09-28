export default function StageHeading({ index, title, note }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-sm text-brass">{index}</span>
        <h2 className="font-display text-2xl font-semibold text-paper">
          {title}
        </h2>
      </div>
      {note && <span className="text-sm text-mist">{note}</span>}
    </div>
  );
}
