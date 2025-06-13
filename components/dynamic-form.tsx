"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion } from "framer-motion"
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Calendar,
  Briefcase,
  Save,
  RefreshCw,
  Home,
  Building,
  CreditCard,
  GraduationCap,
  Heart,
  Car,
  Shield,
  Globe,
  Users,
  Baby,
  Stethoscope,
  Banknote,
  Landmark,
  Plane,
  Book,
  Trophy,
  Gamepad2,
  Wrench,
  Star,
  Flag,
  Clock,
  Target,
  Zap,
  Crown,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

const formSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  middleName: z.string().optional(),
  email: z.string().email("Ingresa un email válido"),
  phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
  alternatePhone: z.string().optional(),
  birthDate: z.string().min(1, "Selecciona una fecha de nacimiento"),
  gender: z.string().min(1, "Selecciona un género"),
  maritalStatus: z.string().min(1, "Selecciona un estado civil"),
  nationality: z.string().min(1, "Selecciona una nacionalidad"),

  // Address Information
  address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  city: z.string().min(2, "La ciudad debe tener al menos 2 caracteres"),
  state: z.string().min(2, "El estado debe tener al menos 2 caracteres"),
  zipCode: z.string().min(3, "El código postal debe tener al menos 3 caracteres"),
  country: z.string().min(1, "Selecciona un país"),

  // Document Information
  documentType: z.string().min(1, "Selecciona un tipo de documento"),
  documentNumber: z.string().min(5, "El número de documento debe tener al menos 5 caracteres"),
  documentIssueDate: z.string().optional(),
  documentExpiryDate: z.string().optional(),
  documentIssuePlace: z.string().optional(),

  // Employment Information
  occupation: z.string().min(2, "La ocupación debe tener al menos 2 caracteres"),
  employer: z.string().optional(),
  workAddress: z.string().optional(),
  workPhone: z.string().optional(),
  workEmail: z.string().optional(),
  jobTitle: z.string().optional(),
  employmentStatus: z.string().optional(),
  workExperience: z.string().optional(),
  monthlyIncome: z.string().optional(),

  // Education Information
  educationLevel: z.string().optional(),
  university: z.string().optional(),
  degree: z.string().optional(),
  graduationYear: z.string().optional(),
  fieldOfStudy: z.string().optional(),

  // Financial Information
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  accountType: z.string().optional(),
  creditScore: z.string().optional(),

  // Emergency Contact
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),

  // Health Information
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  medicalConditions: z.string().optional(),
  medications: z.string().optional(),

  // Additional Information
  hobbies: z.string().optional(),
  languages: z.string().optional(),
  skills: z.string().optional(),
  references: z.string().optional(),
  socialSecurityNumber: z.string().optional(),
  drivingLicenseNumber: z.string().optional(),
  passportNumber: z.string().optional(),
  visaStatus: z.string().optional(),

  // Family Information
  spouseName: z.string().optional(),
  numberOfChildren: z.string().optional(),
  parentNames: z.string().optional(),

  // Preferences
  preferredLanguage: z.string().optional(),
  timeZone: z.string().optional(),
  communicationPreference: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface DynamicFormProps {
  initialData: Partial<FormData>
  onSave: (data: FormData) => void
  onNext: () => void
}

const fieldSections = [
  {
    title: "Información Personal",
    icon: User,
    fields: [
      {
        name: "firstName" as const,
        label: "Nombre",
        icon: User,
        type: "input",
        placeholder: "Ej: Juan",
        description: "Primer nombre",
      },
      {
        name: "lastName" as const,
        label: "Apellido",
        icon: User,
        type: "input",
        placeholder: "Ej: Pérez",
        description: "Apellido paterno",
      },
      {
        name: "middleName" as const,
        label: "Segundo Nombre",
        icon: User,
        type: "input",
        placeholder: "Ej: Carlos",
        description: "Segundo nombre (opcional)",
      },
      {
        name: "birthDate" as const,
        label: "Fecha de Nacimiento",
        icon: Calendar,
        type: "input",
        inputType: "date",
        description: "Fecha de nacimiento",
      },
      {
        name: "gender" as const,
        label: "Género",
        icon: Users,
        type: "select",
        options: [
          { value: "male", label: "Masculino" },
          { value: "female", label: "Femenino" },
          { value: "other", label: "Otro" },
          { value: "prefer-not-to-say", label: "Prefiero no decir" },
        ],
        description: "Género",
      },
      {
        name: "maritalStatus" as const,
        label: "Estado Civil",
        icon: Heart,
        type: "select",
        options: [
          { value: "single", label: "Soltero/a" },
          { value: "married", label: "Casado/a" },
          { value: "divorced", label: "Divorciado/a" },
          { value: "widowed", label: "Viudo/a" },
          { value: "separated", label: "Separado/a" },
        ],
        description: "Estado civil actual",
      },
      {
        name: "nationality" as const,
        label: "Nacionalidad",
        icon: Flag,
        type: "select",
        options: [
          { value: "mexican", label: "Mexicana" },
          { value: "american", label: "Estadounidense" },
          { value: "canadian", label: "Canadiense" },
          { value: "spanish", label: "Española" },
          { value: "other", label: "Otra" },
        ],
        description: "Nacionalidad",
      },
    ],
  },
  {
    title: "Información de Contacto",
    icon: Phone,
    fields: [
      {
        name: "email" as const,
        label: "Correo Electrónico",
        icon: Mail,
        type: "input",
        placeholder: "Ej: juan.perez@email.com",
        description: "Dirección de correo electrónico principal",
      },
      {
        name: "phone" as const,
        label: "Teléfono Principal",
        icon: Phone,
        type: "input",
        placeholder: "Ej: +1234567890",
        description: "Número de teléfono principal",
      },
      {
        name: "alternatePhone" as const,
        label: "Teléfono Alternativo",
        icon: Phone,
        type: "input",
        placeholder: "Ej: +0987654321",
        description: "Número de teléfono alternativo (opcional)",
      },
    ],
  },
  {
    title: "Dirección",
    icon: MapPin,
    fields: [
      {
        name: "address" as const,
        label: "Dirección",
        icon: Home,
        type: "input",
        placeholder: "Ej: Calle Principal 123",
        description: "Dirección completa de residencia",
      },
      {
        name: "city" as const,
        label: "Ciudad",
        icon: Building,
        type: "input",
        placeholder: "Ej: Ciudad de México",
        description: "Ciudad de residencia",
      },
      {
        name: "state" as const,
        label: "Estado/Provincia",
        icon: MapPin,
        type: "input",
        placeholder: "Ej: CDMX",
        description: "Estado o provincia",
      },
      {
        name: "zipCode" as const,
        label: "Código Postal",
        icon: MapPin,
        type: "input",
        placeholder: "Ej: 12345",
        description: "Código postal",
      },
      {
        name: "country" as const,
        label: "País",
        icon: Globe,
        type: "select",
        options: [
          { value: "mexico", label: "México" },
          { value: "usa", label: "Estados Unidos" },
          { value: "canada", label: "Canadá" },
          { value: "spain", label: "España" },
          { value: "other", label: "Otro" },
        ],
        description: "País de residencia",
      },
    ],
  },
  {
    title: "Documentos de Identidad",
    icon: FileText,
    fields: [
      {
        name: "documentType" as const,
        label: "Tipo de Documento",
        icon: FileText,
        type: "select",
        options: [
          { value: "cedula", label: "Cédula de Identidad" },
          { value: "pasaporte", label: "Pasaporte" },
          { value: "licencia", label: "Licencia de Conducir" },
          { value: "otro", label: "Otro" },
        ],
        description: "Tipo de documento principal",
      },
      {
        name: "documentNumber" as const,
        label: "Número de Documento",
        icon: FileText,
        type: "input",
        placeholder: "Ej: 12345678",
        description: "Número único del documento",
      },
      {
        name: "documentIssueDate" as const,
        label: "Fecha de Emisión",
        icon: Calendar,
        type: "input",
        inputType: "date",
        description: "Fecha de emisión del documento",
      },
      {
        name: "documentExpiryDate" as const,
        label: "Fecha de Vencimiento",
        icon: Calendar,
        type: "input",
        inputType: "date",
        description: "Fecha de vencimiento del documento",
      },
      {
        name: "documentIssuePlace" as const,
        label: "Lugar de Emisión",
        icon: MapPin,
        type: "input",
        placeholder: "Ej: Ciudad de México",
        description: "Lugar donde se emitió el documento",
      },
      {
        name: "drivingLicenseNumber" as const,
        label: "Número de Licencia",
        icon: Car,
        type: "input",
        placeholder: "Ej: DL123456789",
        description: "Número de licencia de conducir",
      },
      {
        name: "passportNumber" as const,
        label: "Número de Pasaporte",
        icon: Plane,
        type: "input",
        placeholder: "Ej: P123456789",
        description: "Número de pasaporte",
      },
      {
        name: "socialSecurityNumber" as const,
        label: "Número de Seguro Social",
        icon: Shield,
        type: "input",
        placeholder: "Ej: 123-45-6789",
        description: "Número de seguro social",
      },
    ],
  },
  {
    title: "Información Laboral",
    icon: Briefcase,
    fields: [
      {
        name: "occupation" as const,
        label: "Ocupación",
        icon: Briefcase,
        type: "input",
        placeholder: "Ej: Ingeniero de Software",
        description: "Profesión u ocupación actual",
      },
      {
        name: "employer" as const,
        label: "Empleador",
        icon: Building,
        type: "input",
        placeholder: "Ej: Tech Company Inc.",
        description: "Nombre del empleador actual",
      },
      {
        name: "jobTitle" as const,
        label: "Cargo",
        icon: Crown,
        type: "input",
        placeholder: "Ej: Desarrollador Senior",
        description: "Título del puesto actual",
      },
      {
        name: "employmentStatus" as const,
        label: "Estado Laboral",
        icon: Target,
        type: "select",
        options: [
          { value: "employed", label: "Empleado" },
          { value: "self-employed", label: "Trabajador Independiente" },
          { value: "unemployed", label: "Desempleado" },
          { value: "student", label: "Estudiante" },
          { value: "retired", label: "Jubilado" },
        ],
        description: "Estado laboral actual",
      },
      {
        name: "workAddress" as const,
        label: "Dirección de Trabajo",
        icon: Building,
        type: "input",
        placeholder: "Ej: Av. Reforma 123",
        description: "Dirección del lugar de trabajo",
      },
      {
        name: "workPhone" as const,
        label: "Teléfono de Trabajo",
        icon: Phone,
        type: "input",
        placeholder: "Ej: +1234567890",
        description: "Número de teléfono del trabajo",
      },
      {
        name: "workEmail" as const,
        label: "Email de Trabajo",
        icon: Mail,
        type: "input",
        placeholder: "Ej: juan@empresa.com",
        description: "Correo electrónico del trabajo",
      },
      {
        name: "workExperience" as const,
        label: "Años de Experiencia",
        icon: Clock,
        type: "input",
        placeholder: "Ej: 5 años",
        description: "Años de experiencia laboral",
      },
      {
        name: "monthlyIncome" as const,
        label: "Ingresos Mensuales",
        icon: Banknote,
        type: "input",
        placeholder: "Ej: $50,000",
        description: "Ingresos mensuales aproximados",
      },
    ],
  },
  {
    title: "Educación",
    icon: GraduationCap,
    fields: [
      {
        name: "educationLevel" as const,
        label: "Nivel Educativo",
        icon: GraduationCap,
        type: "select",
        options: [
          { value: "primary", label: "Primaria" },
          { value: "secondary", label: "Secundaria" },
          { value: "high-school", label: "Preparatoria" },
          { value: "bachelor", label: "Licenciatura" },
          { value: "master", label: "Maestría" },
          { value: "doctorate", label: "Doctorado" },
        ],
        description: "Nivel educativo más alto completado",
      },
      {
        name: "university" as const,
        label: "Universidad",
        icon: Building,
        type: "input",
        placeholder: "Ej: Universidad Nacional",
        description: "Nombre de la institución educativa",
      },
      {
        name: "degree" as const,
        label: "Título/Grado",
        icon: Trophy,
        type: "input",
        placeholder: "Ej: Ingeniería en Sistemas",
        description: "Título o grado obtenido",
      },
      {
        name: "fieldOfStudy" as const,
        label: "Campo de Estudio",
        icon: Book,
        type: "input",
        placeholder: "Ej: Ciencias de la Computación",
        description: "Área de especialización",
      },
      {
        name: "graduationYear" as const,
        label: "Año de Graduación",
        icon: Calendar,
        type: "input",
        placeholder: "Ej: 2020",
        description: "Año de graduación",
      },
    ],
  },
  {
    title: "Información Financiera",
    icon: CreditCard,
    fields: [
      {
        name: "bankName" as const,
        label: "Banco Principal",
        icon: Landmark,
        type: "input",
        placeholder: "Ej: Banco Nacional",
        description: "Nombre del banco principal",
      },
      {
        name: "accountNumber" as const,
        label: "Número de Cuenta",
        icon: CreditCard,
        type: "input",
        placeholder: "Ej: 1234567890",
        description: "Número de cuenta bancaria",
      },
      {
        name: "accountType" as const,
        label: "Tipo de Cuenta",
        icon: CreditCard,
        type: "select",
        options: [
          { value: "checking", label: "Cuenta Corriente" },
          { value: "savings", label: "Cuenta de Ahorros" },
          { value: "business", label: "Cuenta Empresarial" },
        ],
        description: "Tipo de cuenta bancaria",
      },
      {
        name: "creditScore" as const,
        label: "Puntuación Crediticia",
        icon: Star,
        type: "input",
        placeholder: "Ej: 750",
        description: "Puntuación crediticia actual",
      },
    ],
  },
  {
    title: "Contacto de Emergencia",
    icon: Shield,
    fields: [
      {
        name: "emergencyContactName" as const,
        label: "Nombre del Contacto",
        icon: User,
        type: "input",
        placeholder: "Ej: María Pérez",
        description: "Nombre completo del contacto de emergencia",
      },
      {
        name: "emergencyContactPhone" as const,
        label: "Teléfono de Emergencia",
        icon: Phone,
        type: "input",
        placeholder: "Ej: +1234567890",
        description: "Número de teléfono del contacto de emergencia",
      },
      {
        name: "emergencyContactRelation" as const,
        label: "Relación",
        icon: Heart,
        type: "select",
        options: [
          { value: "spouse", label: "Cónyuge" },
          { value: "parent", label: "Padre/Madre" },
          { value: "sibling", label: "Hermano/a" },
          { value: "child", label: "Hijo/a" },
          { value: "friend", label: "Amigo/a" },
          { value: "other", label: "Otro" },
        ],
        description: "Relación con el contacto de emergencia",
      },
    ],
  },
  {
    title: "Información de Salud",
    icon: Stethoscope,
    fields: [
      {
        name: "bloodType" as const,
        label: "Tipo de Sangre",
        icon: Stethoscope,
        type: "select",
        options: [
          { value: "a+", label: "A+" },
          { value: "a-", label: "A-" },
          { value: "b+", label: "B+" },
          { value: "b-", label: "B-" },
          { value: "ab+", label: "AB+" },
          { value: "ab-", label: "AB-" },
          { value: "o+", label: "O+" },
          { value: "o-", label: "O-" },
        ],
        description: "Tipo de sangre",
      },
      {
        name: "allergies" as const,
        label: "Alergias",
        icon: Stethoscope,
        type: "input",
        placeholder: "Ej: Polen, mariscos",
        description: "Alergias conocidas",
      },
      {
        name: "medicalConditions" as const,
        label: "Condiciones Médicas",
        icon: Stethoscope,
        type: "input",
        placeholder: "Ej: Diabetes, hipertensión",
        description: "Condiciones médicas actuales",
      },
      {
        name: "medications" as const,
        label: "Medicamentos",
        icon: Stethoscope,
        type: "input",
        placeholder: "Ej: Aspirina, vitaminas",
        description: "Medicamentos que toma regularmente",
      },
    ],
  },
  {
    title: "Información Familiar",
    icon: Users,
    fields: [
      {
        name: "spouseName" as const,
        label: "Nombre del Cónyuge",
        icon: Heart,
        type: "input",
        placeholder: "Ej: Ana García",
        description: "Nombre completo del cónyuge",
      },
      {
        name: "numberOfChildren" as const,
        label: "Número de Hijos",
        icon: Baby,
        type: "input",
        placeholder: "Ej: 2",
        description: "Número de hijos",
      },
      {
        name: "parentNames" as const,
        label: "Nombres de los Padres",
        icon: Users,
        type: "input",
        placeholder: "Ej: Carlos Pérez, María López",
        description: "Nombres de los padres",
      },
    ],
  },
  {
    title: "Información Adicional",
    icon: Star,
    fields: [
      {
        name: "hobbies" as const,
        label: "Pasatiempos",
        icon: Gamepad2,
        type: "input",
        placeholder: "Ej: Lectura, deportes, música",
        description: "Pasatiempos e intereses",
      },
      {
        name: "languages" as const,
        label: "Idiomas",
        icon: Globe,
        type: "input",
        placeholder: "Ej: Español, Inglés, Francés",
        description: "Idiomas que habla",
      },
      {
        name: "skills" as const,
        label: "Habilidades",
        icon: Wrench,
        type: "input",
        placeholder: "Ej: Programación, diseño, liderazgo",
        description: "Habilidades profesionales",
      },
      {
        name: "references" as const,
        label: "Referencias",
        icon: Users,
        type: "input",
        placeholder: "Ej: Dr. Smith (+123456789)",
        description: "Referencias profesionales o personales",
      },
    ],
  },
  {
    title: "Preferencias",
    icon: Zap,
    fields: [
      {
        name: "preferredLanguage" as const,
        label: "Idioma Preferido",
        icon: Globe,
        type: "select",
        options: [
          { value: "spanish", label: "Español" },
          { value: "english", label: "Inglés" },
          { value: "french", label: "Francés" },
          { value: "portuguese", label: "Portugués" },
        ],
        description: "Idioma preferido para comunicación",
      },
      {
        name: "timeZone" as const,
        label: "Zona Horaria",
        icon: Clock,
        type: "select",
        options: [
          { value: "america/mexico_city", label: "México (GMT-6)" },
          { value: "america/new_york", label: "Nueva York (GMT-5)" },
          { value: "america/los_angeles", label: "Los Ángeles (GMT-8)" },
          { value: "europe/madrid", label: "Madrid (GMT+1)" },
        ],
        description: "Zona horaria local",
      },
      {
        name: "communicationPreference" as const,
        label: "Preferencia de Comunicación",
        icon: Mail,
        type: "select",
        options: [
          { value: "email", label: "Correo Electrónico" },
          { value: "phone", label: "Teléfono" },
          { value: "sms", label: "SMS" },
          { value: "whatsapp", label: "WhatsApp" },
        ],
        description: "Método preferido de comunicación",
      },
      {
        name: "visaStatus" as const,
        label: "Estado de Visa",
        icon: Plane,
        type: "select",
        options: [
          { value: "citizen", label: "Ciudadano" },
          { value: "permanent_resident", label: "Residente Permanente" },
          { value: "work_visa", label: "Visa de Trabajo" },
          { value: "student_visa", label: "Visa de Estudiante" },
          { value: "tourist", label: "Turista" },
        ],
        description: "Estado migratorio actual",
      },
    ],
  },
]

export function DynamicForm({ initialData, onSave, onNext }: DynamicFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      onSave(data)
      toast({
        title: "Datos guardados exitosamente",
        description: "La información ha sido actualizada correctamente.",
      })
      // Scroll to top when proceeding to next step
      window.scrollTo({ top: 0, behavior: "smooth" })
      onNext()
    } catch (error) {
      toast({
        title: "Error al guardar",
        description: "Hubo un problema al guardar los datos. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    form.reset(initialData)
    // Force update select components
    Object.keys(initialData).forEach((key) => {
      form.setValue(key as keyof FormData, initialData[key as keyof FormData] || "")
    })
    toast({
      title: "Formulario restablecido",
      description: "Los datos han sido restaurados a los valores originales.",
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Verificar y Editar Información</CardTitle>
        <CardDescription>
          Revisa y modifica la información extraída de tus documentos. Completa todos los campos requeridos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {fieldSections.map((section, sectionIndex) => {
              const SectionIcon = section.icon
              return (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: sectionIndex * 0.1 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <SectionIcon className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">{section.title}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {section.fields.map((field, fieldIndex) => {
                      const Icon = field.icon
                      return (
                        <motion.div
                          key={field.name}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: sectionIndex * 0.1 + fieldIndex * 0.05 }}
                        >
                          <FormField
                            control={form.control}
                            name={field.name}
                            render={({ field: formField }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Icon className="h-4 w-4 text-primary" />
                                  {field.label}
                                </FormLabel>
                                <FormControl>
                                  {field.type === "select" ? (
                                    <Select onValueChange={formField.onChange} value={formField.value || ""}>
                                      <SelectTrigger>
                                        <SelectValue placeholder={`Selecciona ${field.label.toLowerCase()}`} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {field.options?.map((option) => (
                                          <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <Input
                                      type={field.inputType || "text"}
                                      placeholder={field.placeholder}
                                      {...formField}
                                    />
                                  )}
                                </FormControl>
                                <FormDescription className="text-xs">{field.description}</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              )
            })}

            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Restablecer
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar y Continuar
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
