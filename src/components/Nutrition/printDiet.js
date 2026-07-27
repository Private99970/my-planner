import { calcMealMacro, calcDayMacro, r0, kcalTarget } from '../../hooks/useMacro'
import { MEAL_DEFS, GG } from '../../data/diets'

const MEAL_LABELS = {
  col: 'Colazione', pra: 'Pranzo', spu: 'Spuntino', cen: 'Cena', pos: 'Post cena',
}

function foodsCell(foods) {
  if (!foods || foods.length === 0) return '<span class="empty">—</span>'
  return foods.map(([name, g]) => `${name} <b>${g}g</b>`).join('<br>')
}

/**
 * Apre una finestra di stampa con la dieta su A4 orizzontale, una pagina.
 */
export function printDiet(dietName, diet, catalog) {
  const days = diet.days || []
  const targets = diet.targets || { C: 0, P: 0, G: 0 }
  const ktgt = kcalTarget(targets)

  // Medie settimanali
  const wk = days.reduce((a, d) => {
    const m = calcDayMacro(d, catalog, MEAL_DEFS)
    return { k: a.k + m.k, c: a.c + m.c, p: a.p + m.p, f: a.f + m.f }
  }, { k: 0, c: 0, p: 0, f: 0 })
  const n = days.length || 1
  const avg = { k: wk.k / n, c: wk.c / n, p: wk.p / n, f: wk.f / n }

  // Righe pasti
  const mealRows = MEAL_DEFS.map(md => {
    const cells = days.map(d => `<td>${foodsCell(d[md.id])}</td>`).join('')
    return `<tr><th class="rowh">${MEAL_LABELS[md.id]}</th>${cells}</tr>`
  }).join('')

  // Riga totali giornalieri
  const totCells = days.map(d => {
    const m = calcDayMacro(d, catalog, MEAL_DEFS)
    return `<td class="tot">
      <b>${r0(m.k)}</b> kcal<br>
      <span class="c">C ${r0(m.c)}</span> · <span class="p">P ${r0(m.p)}</span> · <span class="g">G ${r0(m.f)}</span>
    </td>`
  }).join('')

  const dayHeaders = GG.map(g => `<th>${g}</th>`).join('')

  const html = `<!DOCTYPE html>
<html lang="it"><head><meta charset="utf-8"><title>${dietName}</title>
<style>
  @page { size: A4 landscape; margin: 9mm; }
  * { box-sizing: border-box; }
  html, body { height: 100%; }
  body {
    font-family: -apple-system, system-ui, sans-serif;
    margin: 0; color: #1e293b;
    display: flex; flex-direction: column;
    height: 100vh;
  }
  h1 { font-size: 19px; margin: 0 0 3px; }
  .sub { font-size: 12px; color: #64748b; margin-bottom: 10px; }
  .sub b { color: #1e293b; }
  table {
    width: 100%; border-collapse: collapse; table-layout: fixed;
    flex: 1;                /* riempie tutta l'altezza disponibile */
    height: 100%;
  }
  th, td { border: 1px solid #cbd5e1; padding: 7px 8px; vertical-align: top; text-align: left; }
  thead th { background: #4f46e5; color: #fff; font-size: 12px; text-align: center; padding: 8px 4px; }
  thead th:first-child { background: #3730a3; width: 78px; }
  .rowh { background: #eef2ff; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: .4px; color: #4338ca; vertical-align: middle; }
  td { font-size: 11px; line-height: 1.6; }
  td b { font-weight: 700; }
  .empty { color: #cbd5e1; }
  .tot { background: #f8fafc; text-align: center; font-size: 11px; vertical-align: middle; }
  .tot b { font-size: 15px; }
  .c { color: #d97706; font-weight: 700; }
  .p { color: #0d9488; font-weight: 700; }
  .g { color: #dc2626; font-weight: 700; }
  tfoot .rowh { background: #dcfce7; color: #166534; }
</style></head>
<body>
  <h1>${dietName}</h1>
  <div class="sub">
    Target: <b>${r0(ktgt)} kcal</b> · C ${targets.C}g · P ${targets.P}g · G ${targets.G}g
    &nbsp;&nbsp;|&nbsp;&nbsp;
    Media settimanale: <b>${r0(avg.k)} kcal</b> · C ${r0(avg.c)}g · P ${r0(avg.p)}g · G ${r0(avg.f)}g
  </div>
  <table>
    <thead><tr><th>Pasto</th>${dayHeaders}</tr></thead>
    <tbody>
      ${mealRows}
    </tbody>
    <tfoot>
      <tr><th class="rowh">Totale</th>${totCells}</tr>
    </tfoot>
  </table>
</body></html>`

  const w = window.open('', '_blank')
  if (!w) { alert('Consenti i popup per stampare.'); return }
  w.document.write(html)
  w.document.close()
  w.focus()
  setTimeout(() => { w.print() }, 300)
}
