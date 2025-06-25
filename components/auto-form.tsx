"use client"

import { useState } from "react"

type AutoFormProps = {
  data: any
  onSave?: (data: any) => void
  readOnly?: boolean
}

function renderField(key: string, value: any, onChange: (val: any) => void, readOnly = false) {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    // Renderiza subformulario para objetos
    return (
      <fieldset
        style={{
          border: "1px solid #eee",
          padding: 16,
          marginBottom: 20,
          background: "#fafbfc",
          borderRadius: 8,
        }}
      >
        <legend style={{ fontWeight: 600, fontSize: 16 }}>{key}</legend>
        <AutoFormInner data={value} onChange={onChange} readOnly={readOnly} />
      </fieldset>
    )
  }
  if (Array.isArray(value)) {
    // Renderiza inputs para arrays
    return (
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontWeight: 500 }}>{key}</label>
        {value.length === 0 && <div style={{ color: "#888", fontSize: 12 }}>Array vacío</div>}
        {value.map((item, idx) => (
          <div key={idx} style={{ marginLeft: 20, marginBottom: 12 }}>
            {renderField(`${key}[${idx}]`, item, (val) => {
              const newArr = [...value]
              newArr[idx] = val
              onChange(newArr)
            }, readOnly)}
          </div>
        ))}
      </div>
    )
  }
  // Renderiza input para string, number, boolean
  const isLongString = typeof value === "string" && value.length > 60
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontWeight: 500, marginBottom: 4 }}>
        {key}:
      </label>
      {isLongString ? (
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: "100%", minHeight: 60, fontFamily: "inherit", fontSize: 14, padding: 6 }}
          readOnly={readOnly}
        />
      ) : (
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 300, fontSize: 14, padding: 6 }}
          readOnly={readOnly}
        />
      )}
    </div>
  )
}

function AutoFormInner({ data, onChange, readOnly = false }: { data: any; onChange: (val: any) => void; readOnly?: boolean }) {
  const [local, setLocal] = useState(data)

  const handleFieldChange = (key: string, val: any) => {
    const updated = { ...local, [key]: val }
    setLocal(updated)
    onChange(updated)
  }

  return (
    <div>
      {Object.entries(local).map(([key, value]) => (
        <div key={key}>
          {renderField(key, value, (val) => handleFieldChange(key, val), readOnly)}
        </div>
      ))}
    </div>
  )
}

export function AutoForm({ data, onSave, readOnly = false }: AutoFormProps) {
  const [formData, setFormData] = useState(data)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (onSave) onSave(formData)
      }}
    >
      <AutoFormInner data={formData} onChange={setFormData} readOnly={readOnly} />
      {!readOnly && (
        <button type="submit" style={{ marginTop: 16, padding: 8 }}>
          Guardar
        </button>
      )}
    </form>
  )
} 