export const r0 = (v) => Math.round(v)
export const r1 = (v) => (Math.round(v * 10) / 10).toFixed(1)

export function calcMacro(food, grams, catalog) {
  const f = catalog[food]
  if (!f) return { k: 0, c: 0, p: 0, f: 0 }
  // catalog format: [kcal, protein, carbs, fat] per 100g
  return {
    k: (f[0] * grams) / 100,
    c: (f[2] * grams) / 100,
    p: (f[1] * grams) / 100,
    f: (f[3] * grams) / 100,
  }
}

export function calcMealMacro(foods, catalog) {
  return (foods || []).reduce(
    (acc, [food, grams]) => {
      const m = calcMacro(food, grams, catalog)
      return { k: acc.k + m.k, c: acc.c + m.c, p: acc.p + m.p, f: acc.f + m.f }
    },
    { k: 0, c: 0, p: 0, f: 0 }
  )
}

export function calcDayMacro(day, catalog, mealDefs) {
  return mealDefs.reduce(
    (acc, md) => {
      const m = calcMealMacro(day[md.id] || [], catalog)
      return { k: acc.k + m.k, c: acc.c + m.c, p: acc.p + m.p, f: acc.f + m.f }
    },
    { k: 0, c: 0, p: 0, f: 0 }
  )
}

export function kcalTarget(targets) {
  return targets.C * 4 + targets.P * 4 + targets.G * 9
}
