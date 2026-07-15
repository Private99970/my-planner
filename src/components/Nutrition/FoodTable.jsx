import { calcMacro, r0, r1 } from '../../hooks/useMacro'

export default function FoodTable({ foods, catalog }) {
  const rows = (foods || []).map(([food, grams]) => {
    const m = calcMacro(food, grams, catalog)
    const missing = !catalog[food]
    return { food, grams, m, missing }
  })

  const tot = rows.reduce(
    (a, { m }) => ({ k: a.k + m.k, c: a.c + m.c, p: a.p + m.p, f: a.f + m.f }),
    { k: 0, c: 0, p: 0, f: 0 }
  )

  return (
    <div className="overflow-x-auto mt-3">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="text-left pb-2 pl-1 text-[9px] uppercase tracking-wider text-slate-400 font-bold" style={{width:'38%'}}>Alimento</th>
            <th className="pb-2 text-right text-[9px] uppercase tracking-wider text-slate-400 font-bold">Grammi</th>
            <th className="pb-2 text-right text-[9px] uppercase tracking-wider font-bold" style={{color:'#d97706'}}>Carbo</th>
            <th className="pb-2 text-right text-[9px] uppercase tracking-wider font-bold" style={{color:'#0d9488'}}>Prot</th>
            <th className="pb-2 text-right text-[9px] uppercase tracking-wider font-bold" style={{color:'#dc2626'}}>Grassi</th>
            <th className="pb-2 text-right text-[9px] uppercase tracking-wider text-slate-400 font-bold">Kcal</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ food, grams, m, missing }, i) => (
            <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
              <td className="py-1.5 pl-1 font-medium text-slate-800">
                {food}
                {missing && <span className="ml-1 text-[10px] text-amber-600 font-bold" title="Alimento rimosso dal catalogo">⚠</span>}
              </td>
              <td className="py-1.5 text-right font-bold text-slate-800">{grams}g</td>
              <td className="py-1.5 text-right text-slate-500">{r1(m.c)}g</td>
              <td className="py-1.5 text-right text-slate-500">{r1(m.p)}g</td>
              <td className="py-1.5 text-right text-slate-500">{r1(m.f)}g</td>
              <td className="py-1.5 text-right text-slate-500">{r0(m.k)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-200">
            <td colSpan={2} className="pt-2 pb-1 pl-1 font-bold text-slate-700">Totale pasto</td>
            <td className="pt-2 pb-1 text-right font-bold text-slate-700">{r1(tot.c)}g</td>
            <td className="pt-2 pb-1 text-right font-bold text-slate-700">{r1(tot.p)}g</td>
            <td className="pt-2 pb-1 text-right font-bold text-slate-700">{r1(tot.f)}g</td>
            <td className="pt-2 pb-1 text-right font-bold text-slate-700">{r0(tot.k)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
