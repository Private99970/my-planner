import { useState } from 'react'
import CatalogFoodList from './CatalogFoodList'
import AddFoodForm from './AddFoodForm'

export default function CatalogPanel({ open, onClose, catalog, customFoods, baseFoods, addFood, editFood, deleteFood }) {
  const [query, setQuery] = useState('')
  const [editingFood, setEditingFood] = useState(null)

  const handleEdit = (name, vals) => setEditingFood({ name, values: vals })
  const handleSaveEdit = (oldName, name, kcal, prot, carbs, fat) => {
    editFood(oldName, name, kcal, prot, carbs, fat)
    setEditingFood(null)
  }

  return (
    <>
      {open && <div className="panel-overlay" onClick={onClose} />}
      <div className={`panel-slide z-50 ${open ? 'open' : 'closed'}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white px-5 py-4 flex items-center gap-3 flex-shrink-0">
          <div className="flex-1">
            <div className="text-[15px] font-bold">📋 Catalogo alimenti</div>
            <div className="text-[10px] text-white/50">{Object.keys(catalog).length} alimenti totali</div>
          </div>
          <button onClick={onClose} className="btn-ghost text-[12px]">✕</button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-slate-100 flex-shrink-0">
          <input
            className="inp w-full"
            placeholder="🔍 Cerca alimento…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        {/* Lists */}
        <div className="flex-1 overflow-y-auto thin-scroll p-4">
          {Object.keys(customFoods).length > 0 && (
            <CatalogFoodList
              title="Alimenti personali"
              foods={customFoods}
              isCustom
              query={query}
              onEdit={handleEdit}
              onDelete={deleteFood}
            />
          )}
          <CatalogFoodList
            title="Alimenti base"
            foods={baseFoods}
            isCustom={false}
            query={query}
          />
          <AddFoodForm
            catalog={catalog}
            onAdd={addFood}
            editingFood={editingFood}
            onCancelEdit={() => setEditingFood(null)}
            onSaveEdit={handleSaveEdit}
          />
        </div>
      </div>
    </>
  )
}
