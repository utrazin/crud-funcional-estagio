import './ReadOnlyFields.css'
export function ReadOnlyFields({ fields }: { fields: { label: string; value: string }[] }) {
  return <dl className="read-only-fields">{fields.map(({ label, value }) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
}
