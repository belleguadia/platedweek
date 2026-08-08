import { useState } from 'react'
import {
  addGroceryItem,
  deleteGroceryItem,
  getGroceryItems,
  pullIngredientsToGrocery,
  updateGroceryItem,
} from '../../lib/api'
import { formatIngredientDisplay } from '../../utils/ingredients'

function GroceryFields({ quantity, description, onQuantityChange, onDescriptionChange, idPrefix }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 shrink-0">
        <label htmlFor={`${idPrefix}-qty`} className="label-tag mb-1 block">
          Qty
        </label>
        <input
          id={`${idPrefix}-qty`}
          type="text"
          inputMode="decimal"
          value={quantity}
          onChange={(event) => onQuantityChange(event.target.value)}
          placeholder="2"
          className="ingredient-input w-full"
        />
      </div>
      <div className="min-w-0 flex-1">
        <label htmlFor={`${idPrefix}-description`} className="label-tag mb-1 block">
          Description
        </label>
        <input
          id={`${idPrefix}-description`}
          type="text"
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          placeholder="e.g. eggs, olive oil"
          className="ingredient-input w-full"
          required
        />
      </div>
    </div>
  )
}

function GroceryItemRow({ item, onToggle, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [description, setDescription] = useState(item.name)
  const [quantity, setQuantity] = useState(item.quantity ?? '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!description.trim()) return
    setSaving(true)
    try {
      const updated = await updateGroceryItem(item.id, {
        name: description.trim(),
        quantity: quantity.trim() || null,
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
    setDescription(item.name)
    setQuantity(item.quantity ?? '')
    setEditing(false)
  }

  if (editing) {
    return (
      <li className="space-y-3 border-b border-separator pb-3">
        <GroceryFields
          idPrefix={`edit-${item.id}`}
          quantity={quantity}
          description={description}
          onQuantityChange={setQuantity}
          onDescriptionChange={setDescription}
        />
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
  onChange,
}) {
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState('')
  const [adding, setAdding] = useState(false)
  const [pulling, setPulling] = useState(false)
  const [pullMessage, setPullMessage] = useState('')

  const handleAdd = async (event) => {
    event.preventDefault()
    if (!description.trim()) return

    setAdding(true)
    try {
      await addGroceryItem(meal.id, {
        name: description,
        quantity,
      })
      onChange(await getGroceryItems(meal.id))
      setDescription('')
      setQuantity('')
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
    setPullMessage('')
    try {
      const result = await pullIngredientsToGrocery(meal.id)
      onChange(result.items)
      setPullMessage(result.message)
    } catch (error) {
      console.error('Pull ingredients failed:', error)
      setPullMessage(error.message || 'Could not pull ingredients from recipe.')
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
          disabled={pulling}
          className="btn-outline w-fit"
        >
          {pulling ? 'Pulling…' : 'Pull ingredients'}
        </button>
      </div>

      {pullMessage && <p className="mb-4 text-xs text-muted">{pullMessage}</p>}

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
        <GroceryFields
          idPrefix="add"
          quantity={quantity}
          description={description}
          onQuantityChange={setQuantity}
          onDescriptionChange={setDescription}
        />
        <button type="submit" disabled={adding || !description.trim()} className="btn-outline">
          {adding ? 'Adding…' : 'Add item'}
        </button>
      </form>
    </section>
  )
}
