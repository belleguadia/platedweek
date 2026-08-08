import { useState } from 'react'
import {
  addGroceryItem,
  deleteGroceryItem,
  getGroceryItems,
  pullIngredientsToGrocery,
  updateGroceryItem,
} from '../../lib/api'
import { formatIngredientDisplay } from '../../utils/ingredients'

function GroceryItemRow({ item, onToggle, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(item.name)
  const [quantity, setQuantity] = useState(item.quantity ?? '')
  const [note, setNote] = useState(item.note ?? '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      const updated = await updateGroceryItem(item.id, {
        name: name.trim(),
        quantity: quantity.trim() || null,
        note: note.trim() || null,
      })
      onUpdate(updated)
      setEditing(false)
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setName(item.name)
    setQuantity(item.quantity ?? '')
    setNote(item.note ?? '')
    setEditing(false)
  }

  if (editing) {
    return (
      <li className="space-y-2 border-b border-separator pb-3">
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="input-field"
        />
        <div className="flex gap-2">
          <input
            type="text"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            placeholder="Qty"
            className="input-field w-24"
          />
          <input
            type="text"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Note"
            className="input-field flex-1"
          />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={handleSave} disabled={saving} className="label-tag text-blue">
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button type="button" onClick={handleCancel} className="label-tag text-muted">
            Cancel
          </button>
        </div>
      </li>
    )
  }

  return (
    <li className="flex items-start gap-3 border-b border-separator pb-3">
      <input
        type="checkbox"
        checked={item.is_checked}
        onChange={() => onToggle(item)}
        className="mt-1 accent-blue"
      />
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${item.is_checked ? 'text-disabled line-through' : 'text-body'}`}>
          {formatIngredientDisplay(item)}
        </p>
        {item.note && <p className="mt-0.5 text-xs text-muted">{item.note}</p>}
        {item.is_auto_added && <p className="label-tag mt-1 text-disabled">From recipe</p>}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="label-tag text-muted hover:text-body"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="label-tag text-muted hover:text-body"
        >
          Delete
        </button>
      </div>
    </li>
  )
}

export default function GrocerySection({
  meal,
  groceryItems,
  recipeIngredients,
  onChange,
}) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [note, setNote] = useState('')
  const [adding, setAdding] = useState(false)
  const [pulling, setPulling] = useState(false)

  const handleAdd = async (event) => {
    event.preventDefault()
    if (!name.trim()) return

    setAdding(true)
    try {
      await addGroceryItem(meal.id, { name, quantity, note })
      onChange(await getGroceryItems(meal.id))
      setName('')
      setQuantity('')
      setNote('')
    } catch (error) {
      console.error(error)
    } finally {
      setAdding(false)
    }
  }

  const handleToggle = async (item) => {
    try {
      await updateGroceryItem(item.id, { is_checked: !item.is_checked })
      onChange(
        groceryItems.map((row) =>
          row.id === item.id ? { ...row, is_checked: !item.is_checked } : row,
        ),
      )
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteGroceryItem(id)
      onChange(groceryItems.filter((item) => item.id !== id))
    } catch (error) {
      console.error(error)
    }
  }

  const handleUpdate = (updated) => {
    onChange(groceryItems.map((row) => (row.id === updated.id ? updated : row)))
  }

  const handlePullIngredients = async () => {
    setPulling(true)
    try {
      onChange(await pullIngredientsToGrocery(meal.id, recipeIngredients))
    } catch (error) {
      console.error(error)
    } finally {
      setPulling(false)
    }
  }

  return (
    <section className="section-divider py-8">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="label-tag">Grocery list</h2>
        <button
          type="button"
          onClick={handlePullIngredients}
          disabled={pulling || recipeIngredients.length === 0}
          className="btn-outline w-fit"
        >
          {pulling ? 'Pulling…' : 'Pull ingredients'}
        </button>
      </div>

      {groceryItems.length === 0 ? (
        <p className="mb-4 text-sm text-disabled">No items yet</p>
      ) : (
        <ul className="mb-4 space-y-3">
          {groceryItems.map((item) => (
            <GroceryItemRow
              key={item.id}
              item={item}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="space-y-3 border-t border-hairline pt-4">
        <p className="label-tag">Add item</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Item name"
            className="input-field flex-1"
            required
          />
          <input
            type="text"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            placeholder="Qty"
            className="input-field sm:w-24"
          />
        </div>
        <input
          type="text"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Note (optional)"
          className="input-field"
        />
        <button type="submit" disabled={adding} className="btn-outline">
          {adding ? 'Adding…' : 'Add item'}
        </button>
      </form>
    </section>
  )
}
