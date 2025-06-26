"use client"

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
      <AccordionItem value={sectionId} key={sectionId} className="border-loanshark-neutral-light">
        <AccordionTrigger className="text-loanshark-neutral-dark hover:text-loanshark-teal">
          {key}
        </AccordionTrigger>
        <AccordionContent>
          <AutoFormInner data={value} onChange={onChange} readOnly={readOnly} path={path.concat(key)} />
        </AccordionContent>
      </AccordionItem>
    )
  }
  if (Array.isArray(value)) {
    // Renderiza inputs para arrays
    return (
      <div className="mb-5" key={key}>
        <Label className="font-medium text-loanshark-neutral-dark">{key}</Label>
        {value.length === 0 && <div className="text-loanshark-neutral-dark/60 text-sm">Empty array</div>}
        {value.map((item, idx) => (
          <div key={idx} className="ml-5 mb-3">
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
    <div className="mb-4" key={key}>
      <Label className="block font-medium text-loanshark-neutral-dark mb-2">
        {key}:
      </Label>
      {isLongString ? (
        <Textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-[60px] border-loanshark-neutral-light focus:border-loanshark-teal"
          readOnly={readOnly}
        />
      ) : (
        <Input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full max-w-md border-loanshark-neutral-light focus:border-loanshark-teal"
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
        <Accordion type="multiple" defaultValue={objectKeys.map(([key]) => path.concat(key).join("-"))} className="mb-6">
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
      className="space-y-4"
    >
      <AutoFormInner data={formData} onChange={setFormData} readOnly={readOnly} />
      {!readOnly && (
        <Button 
          type="submit" 
          className="bg-loanshark-gradient hover:opacity-90 text-white border-0"
        >
          Save Changes
        </Button>
      )}
    </form>
  )
} 