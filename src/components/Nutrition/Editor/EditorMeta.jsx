export default function EditorMeta({ name, targets, onChange }) {
  const field = (label, id, value, placeholder, width = 'w-20') => (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</label>
      <input
        className={`inp ${width} text-[13px] text-center`}
        value={value}
        placeholder={placeholder}
        type={id === 'name' ? 'text' : 'number'}
        onChange={e => onChange(id, e.target.value)}
      />
    </div>
  )
  return (
    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
      <div className="mb-2">
        {field('Nome dieta', 'name', name, 'es. La mia 2000 kcal', 'w-full text-left')}
      </div>
      <div className="flex gap-3 items-end">
        {field('Carbo (g)', 'C', targets.C, '205')}
        {field('Proteine (g)', 'P', targets.P, '160')}
        {field('Grassi (g)', 'G', targets.G, '60')}
      </div>
    </div>
  )
}
