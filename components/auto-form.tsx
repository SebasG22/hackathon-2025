"use client"

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { useState } from "react"

type AutoFormProps = {
  data: any
  onSave?: (data: any) => void
  readOnly?: boolean
}

function renderField(key: string, value: any, onChange: (val: any) => void, readOnly = false, path: string[] = []) {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    // Renderiza subformulario para objetos como un AccordionItem
    const sectionId = path.concat(key).join("-")
    return (
      <AccordionItem value={sectionId} key={sectionId}>
        <AccordionTrigger>{key}</AccordionTrigger>
        <AccordionContent>
          <AutoFormInner data={value} onChange={onChange} readOnly={readOnly} path={path.concat(key)} />
        </AccordionContent>
      </AccordionItem>
    )
  }
  if (Array.isArray(value)) {
    // Renderiza inputs para arrays
    return (
      <div style={{ marginBottom: 20 }} key={key}>
        <label style={{ fontWeight: 500 }}>{key}</label>
        {value.length === 0 && <div style={{ color: "#888", fontSize: 12 }}>Array vacío</div>}
        {value.map((item, idx) => (
          <div key={idx} style={{ marginLeft: 20, marginBottom: 12 }}>
            {renderField(`${key}[${idx}]`, item, (val) => {
              const newArr = [...value]
              newArr[idx] = val
              onChange(newArr)
            }, readOnly, path.concat(`${key}[${idx}]`))}
          </div>
        ))}
      </div>
    )
  }
  // Renderiza input para string, number, boolean
  const isLongString = typeof value === "string" && value.length > 60
  return (
    <div style={{ marginBottom: 18 }} key={key}>
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

function AutoFormInner({ data, onChange, readOnly = false, path = [] }: { data: any; onChange: (val: any) => void; readOnly?: boolean; path?: string[] }) {
  const [local, setLocal] = useState(data)

  const handleFieldChange = (key: string, val: any) => {
    const updated = { ...local, [key]: val }
    setLocal(updated)
    onChange(updated)
  }

  // Agrupa los campos objeto para el Accordion
  const objectKeys = Object.entries(local).filter(([_, value]) => typeof value === "object" && value !== null && !Array.isArray(value))
  const otherKeys = Object.entries(local).filter(([_, value]) => !(typeof value === "object" && value !== null && !Array.isArray(value)))

  return (
    <div>
      {objectKeys.length > 0 && (
        <Accordion type="multiple" defaultValue={objectKeys.map(([key]) => path.concat(key).join("-"))}>
          {objectKeys.map(([key, value]) =>
            renderField(key, value, (val) => handleFieldChange(key, val), readOnly, path)
          )}
        </Accordion>
      )}
      {otherKeys.map(([key, value]) =>
        renderField(key, value, (val) => handleFieldChange(key, val), readOnly, path)
      )}
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