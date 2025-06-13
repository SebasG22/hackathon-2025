"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion } from "framer-motion"
import {
  User,
  Phone,
  MapPin,
  FileText,
  Briefcase,
  Save,
  RefreshCw,
  Home,
  Building,
  CreditCard,
  DollarSign,
  Calculator,
  Receipt,
  Banknote,
  Shield,
  Users,
  Heart,
  Landmark,
  TrendingUp,
  FileCheck,
  CheckCircle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

const taxFormSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  socialSecurityNumber: z.string().min(9, "SSN must have 9 digits"),
  spouseFirstName: z.string().optional(),
  spouseLastName: z.string().optional(),
  spouseSocialSecurityNumber: z.string().optional(),

  // Address Information
  homeAddress: z.string().min(5, "Address required"),
  apartmentNumber: z.string().optional(),
  city: z.string().min(1, "City required"),
  state: z.string().min(1, "State required"),
  zipCode: z.string().min(5, "ZIP code required"),
  foreignCountry: z.string().optional(),
  foreignProvince: z.string().optional(),
  foreignPostalCode: z.string().optional(),

  // Filing Status
  filingStatus: z.string().min(1, "Filing status required"),
  qualifyingPersonName: z.string().optional(),

  // Presidential Election Campaign
  presidentialCampaignYou: z.string().optional(),
  presidentialCampaignSpouse: z.string().optional(),

  // Exemptions
  exemptionYourself: z.string().optional(),
  exemptionSpouse: z.string().optional(),
  totalExemptions: z.string().optional(),

  // Dependents Information
  dependent1FirstName: z.string().optional(),
  dependent1LastName: z.string().optional(),
  dependent1SSN: z.string().optional(),
  dependent1Relationship: z.string().optional(),
  dependent1ChildTaxCredit: z.string().optional(),
  dependent2FirstName: z.string().optional(),
  dependent2LastName: z.string().optional(),
  dependent2SSN: z.string().optional(),
  dependent2Relationship: z.string().optional(),
  dependent2ChildTaxCredit: z.string().optional(),
  dependent3FirstName: z.string().optional(),
  dependent3LastName: z.string().optional(),
  dependent3SSN: z.string().optional(),
  dependent3Relationship: z.string().optional(),
  dependent3ChildTaxCredit: z.string().optional(),
  dependent4FirstName: z.string().optional(),
  dependent4LastName: z.string().optional(),
  dependent4SSN: z.string().optional(),
  dependent4Relationship: z.string().optional(),
  dependent4ChildTaxCredit: z.string().optional(),

  // Income Information
  wagesSalariesTips: z.string().optional(),
  taxableInterest: z.string().optional(),
  taxExemptInterest: z.string().optional(),
  ordinaryDividends: z.string().optional(),
  qualifiedDividends: z.string().optional(),
  taxableRefunds: z.string().optional(),
  alimonyReceived: z.string().optional(),
  businessIncome: z.string().optional(),
  capitalGainLoss: z.string().optional(),
  otherGainsLosses: z.string().optional(),
  iraDistributions: z.string().optional(),
  iraDistributionsTaxable: z.string().optional(),
  pensionsAnnuities: z.string().optional(),
  pensionsAnnuitiesTaxable: z.string().optional(),
  rentalRealEstate: z.string().optional(),
  farmIncome: z.string().optional(),
  unemploymentCompensation: z.string().optional(),
  socialSecurityBenefits: z.string().optional(),
  socialSecurityBenefitsTaxable: z.string().optional(),
  otherIncome: z.string().optional(),
  totalIncome: z.string().optional(),

  // Adjusted Gross Income Deductions
  educatorExpenses: z.string().optional(),
  businessExpenses: z.string().optional(),
  healthSavingsAccount: z.string().optional(),
  movingExpenses: z.string().optional(),
  selfEmploymentTax: z.string().optional(),
  sepSimpleQualified: z.string().optional(),
  selfEmployedHealthInsurance: z.string().optional(),
  penaltyEarlyWithdrawal: z.string().optional(),
  alimonyPaid: z.string().optional(),
  alimonyRecipientSSN: z.string().optional(),
  iraDeduction: z.string().optional(),
  studentLoanInterest: z.string().optional(),
  tuitionFees: z.string().optional(),
  domesticProductionActivities: z.string().optional(),
  adjustedGrossIncome: z.string().optional(),

  // Tax and Credits
  standardDeduction: z.string().optional(),
  itemizedDeductions: z.string().optional(),
  exemptionsAmount: z.string().optional(),
  taxableIncome: z.string().optional(),
  tax: z.string().optional(),
  alternativeMinimumTax: z.string().optional(),
  excessAdvancePremiumTax: z.string().optional(),
  foreignTaxCredit: z.string().optional(),
  childDependentCareCredit: z.string().optional(),
  educationCredits: z.string().optional(),
  retirementSavingsCredit: z.string().optional(),
  childTaxCredit: z.string().optional(),
  residentialEnergyCredits: z.string().optional(),
  otherCredits: z.string().optional(),
  totalCredits: z.string().optional(),

  // Other Taxes
  selfEmploymentTaxOther: z.string().optional(),
  unreportedSocialSecurityMedicare: z.string().optional(),
  additionalTaxIRA: z.string().optional(),
  householdEmploymentTaxes: z.string().optional(),
  firstTimeHomebuyerCredit: z.string().optional(),
  healthCareIndividualResponsibility: z.string().optional(),
  otherTaxes: z.string().optional(),
  totalTax: z.string().optional(),

  // Payments
  federalIncomeTaxWithheld: z.string().optional(),
  estimatedTaxPayments: z.string().optional(),
  earnedIncomeCredit: z.string().optional(),
  nontaxableCombatPay: z.string().optional(),
  additionalChildTaxCredit: z.string().optional(),
  americanOpportunityCredit: z.string().optional(),
  netPremiumTaxCredit: z.string().optional(),
  amountPaidWithExtension: z.string().optional(),
  excessSocialSecurityTax: z.string().optional(),
  creditFederalTaxFuels: z.string().optional(),
  otherPayments: z.string().optional(),
  totalPayments: z.string().optional(),

  // Refund or Amount Owed
  overpaidAmount: z.string().optional(),
  refundAmount: z.string().optional(),
  routingNumber: z.string().optional(),
  accountType: z.string().optional(),
  accountNumber: z.string().optional(),
  appliedToEstimatedTax: z.string().optional(),
  amountOwed: z.string().optional(),
  estimatedTaxPenalty: z.string().optional(),

  // Third Party Designee
  thirdPartyDesignee: z.string().optional(),
  designeeName: z.string().optional(),
  designeePhone: z.string().optional(),
  designeePIN: z.string().optional(),

  // Signature Information
  taxpayerOccupation: z.string().optional(),
  spouseOccupation: z.string().optional(),
  daytimePhone: z.string().optional(),
  identityProtectionPIN: z.string().optional(),

  // Preparer Information
  preparerName: z.string().optional(),
  preparerPTIN: z.string().optional(),
  preparerSelfEmployed: z.string().optional(),
  firmName: z.string().optional(),
  firmEIN: z.string().optional(),
  firmAddress: z.string().optional(),
  firmPhone: z.string().optional(),
})

type TaxFormData = z.infer<typeof taxFormSchema>

interface TaxFormDynamicProps {
  initialData: Partial<TaxFormData>
  onSave: (data: TaxFormData) => void
  onNext: () => void
}

const taxFieldSections = [
  {
    title: "Taxpayer Personal Information",
    icon: User,
    fields: [
      {
        name: "firstName" as const,
        label: "First Name",
        icon: User,
        type: "input",
        placeholder: "e.g., Soledad",
        description: "Taxpayer's first name",
      },
      {
        name: "lastName" as const,
        label: "Last Name",
        icon: User,
        type: "input",
        placeholder: "e.g., Garcia",
        description: "Taxpayer's last name",
      },
      {
        name: "socialSecurityNumber" as const,
        label: "Social Security Number",
        icon: Shield,
        type: "input",
        placeholder: "e.g., 101782547",
        description: "Taxpayer's SSN",
      },
      {
        name: "spouseFirstName" as const,
        label: "Spouse First Name",
        icon: Heart,
        type: "input",
        placeholder: "Spouse's first name",
        description: "Spouse's first name (if applicable)",
      },
      {
        name: "spouseLastName" as const,
        label: "Spouse Last Name",
        icon: Heart,
        type: "input",
        placeholder: "Spouse's last name",
        description: "Spouse's last name (if applicable)",
      },
      {
        name: "spouseSocialSecurityNumber" as const,
        label: "Spouse SSN",
        icon: Shield,
        type: "input",
        placeholder: "Spouse's SSN",
        description: "Spouse's Social Security Number",
      },
    ],
  },
  {
    title: "Address",
    icon: Home,
    fields: [
      {
        name: "homeAddress" as const,
        label: "Home Address",
        icon: Home,
        type: "input",
        placeholder: "e.g., 1600 Pennsylvania Avenue NW",
        description: "Complete residential address",
      },
      {
        name: "apartmentNumber" as const,
        label: "Apartment Number",
        icon: Building,
        type: "input",
        placeholder: "Apt. No.",
        description: "Apartment number (optional)",
      },
      {
        name: "city" as const,
        label: "City",
        icon: Building,
        type: "input",
        placeholder: "e.g., Washington",
        description: "City of residence",
      },
      {
        name: "state" as const,
        label: "State",
        icon: MapPin,
        type: "input",
        placeholder: "e.g., DC",
        description: "State of residence",
      },
      {
        name: "zipCode" as const,
        label: "ZIP Code",
        icon: MapPin,
        type: "input",
        placeholder: "e.g., 20500",
        description: "ZIP code",
      },
      {
        name: "foreignCountry" as const,
        label: "Foreign Country",
        icon: MapPin,
        type: "input",
        placeholder: "Foreign country (if applicable)",
        description: "Only if foreign address",
      },
      {
        name: "foreignProvince" as const,
        label: "Foreign Province/State",
        icon: MapPin,
        type: "input",
        placeholder: "Foreign province",
        description: "Foreign province or state",
      },
      {
        name: "foreignPostalCode" as const,
        label: "Foreign Postal Code",
        icon: MapPin,
        type: "input",
        placeholder: "Foreign postal code",
        description: "Foreign postal code",
      },
    ],
  },
  {
    title: "Filing Status",
    icon: FileCheck,
    fields: [
      {
        name: "filingStatus" as const,
        label: "Filing Status",
        icon: FileCheck,
        type: "select",
        options: [
          { value: "single", label: "Single" },
          { value: "married_jointly", label: "Married Filing Jointly" },
          { value: "married_separately", label: "Married Filing Separately" },
          { value: "head_household", label: "Head of Household" },
          { value: "qualifying_widow", label: "Qualifying Widow(er)" },
        ],
        description: "Tax filing status",
      },
      {
        name: "qualifyingPersonName" as const,
        label: "Qualifying Person Name",
        icon: User,
        type: "input",
        placeholder: "Qualifying person name",
        description: "For head of household (if applicable)",
      },
      {
        name: "presidentialCampaignYou" as const,
        label: "Presidential Campaign - You",
        icon: CheckCircle,
        type: "select",
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ],
        description: "Do you want to contribute $3 to the presidential campaign?",
      },
      {
        name: "presidentialCampaignSpouse" as const,
        label: "Presidential Campaign - Spouse",
        icon: CheckCircle,
        type: "select",
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ],
        description: "Does your spouse want to contribute $3?",
      },
    ],
  },
  {
    title: "Exemptions",
    icon: Users,
    fields: [
      {
        name: "exemptionYourself" as const,
        label: "Personal Exemption",
        icon: User,
        type: "select",
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ],
        description: "Can you claim personal exemption?",
      },
      {
        name: "exemptionSpouse" as const,
        label: "Spouse Exemption",
        icon: Heart,
        type: "select",
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ],
        description: "Can you claim spouse exemption?",
      },
      {
        name: "totalExemptions" as const,
        label: "Total Exemptions",
        icon: Calculator,
        type: "input",
        placeholder: "e.g., 1",
        description: "Total number of exemptions claimed",
      },
    ],
  },
  {
    title: "Income",
    icon: DollarSign,
    fields: [
      {
        name: "wagesSalariesTips" as const,
        label: "Wages, Salaries, Tips",
        icon: Banknote,
        type: "input",
        placeholder: "e.g., 91118",
        description: "Line 7 - Attach Form(s) W-2",
      },
      {
        name: "taxableInterest" as const,
        label: "Taxable Interest",
        icon: TrendingUp,
        type: "input",
        placeholder: "Taxable interest",
        description: "Line 8a - Attach Schedule B if required",
      },
      {
        name: "taxExemptInterest" as const,
        label: "Tax-Exempt Interest",
        icon: TrendingUp,
        type: "input",
        placeholder: "Tax-exempt interest",
        description: "Line 8b - Do not include on line 8a",
      },
      {
        name: "ordinaryDividends" as const,
        label: "Ordinary Dividends",
        icon: TrendingUp,
        type: "input",
        placeholder: "Ordinary dividends",
        description: "Line 9a - Attach Schedule B if required",
      },
      {
        name: "qualifiedDividends" as const,
        label: "Qualified Dividends",
        icon: TrendingUp,
        type: "input",
        placeholder: "Qualified dividends",
        description: "Line 9b - Qualified dividends",
      },
      {
        name: "businessIncome" as const,
        label: "Business Income",
        icon: Briefcase,
        type: "input",
        placeholder: "e.g., 91118",
        description: "Line 12 - Attach Schedule C or C-EZ",
      },
      {
        name: "rentalRealEstate" as const,
        label: "Rental Real Estate",
        icon: Home,
        type: "input",
        placeholder: "e.g., 1118",
        description: "Line 17 - Attach Schedule E",
      },
      {
        name: "totalIncome" as const,
        label: "Total Income",
        icon: Calculator,
        type: "input",
        placeholder: "e.g., 92236",
        description: "Line 22 - Sum of lines 7 through 21",
      },
    ],
  },
  {
    title: "Adjusted Gross Income",
    icon: Receipt,
    fields: [
      {
        name: "adjustedGrossIncome" as const,
        label: "Adjusted Gross Income",
        icon: Calculator,
        type: "input",
        placeholder: "e.g., 91118",
        description: "Line 37 - Adjusted gross income",
      },
    ],
  },
  {
    title: "Tax and Credits",
    icon: Calculator,
    fields: [
      {
        name: "standardDeduction" as const,
        label: "Standard Deduction",
        icon: Receipt,
        type: "input",
        placeholder: "e.g., 12700",
        description: "Line 40 - Standard or itemized deduction",
      },
      {
        name: "exemptionsAmount" as const,
        label: "Exemptions Amount",
        icon: Users,
        type: "input",
        placeholder: "e.g., 8100",
        description: "Line 42 - Multiply $4,050 by number of exemptions",
      },
      {
        name: "taxableIncome" as const,
        label: "Taxable Income",
        icon: Calculator,
        type: "input",
        placeholder: "e.g., 70318",
        description: "Line 43 - Taxable income",
      },
      {
        name: "tax" as const,
        label: "Tax",
        icon: Calculator,
        type: "input",
        placeholder: "e.g., 10374",
        description: "Line 44 - Tax (see instructions)",
      },
    ],
  },
  {
    title: "Payments",
    icon: CreditCard,
    fields: [
      {
        name: "federalIncomeTaxWithheld" as const,
        label: "Federal Income Tax Withheld",
        icon: Receipt,
        type: "input",
        placeholder: "e.g., 11478",
        description: "Line 64 - From Forms W-2 and 1099",
      },
    ],
  },
  {
    title: "Refund or Amount Owed",
    icon: Landmark,
    fields: [
      {
        name: "overpaidAmount" as const,
        label: "Overpaid Amount",
        icon: TrendingUp,
        type: "input",
        placeholder: "e.g., 1104",
        description: "Line 75 - If line 74 is more than line 63",
      },
      {
        name: "refundAmount" as const,
        label: "Refund Amount",
        icon: Banknote,
        type: "input",
        placeholder: "Refund amount",
        description: "Line 76a - Amount you want refunded to you",
      },
      {
        name: "routingNumber" as const,
        label: "Routing Number",
        icon: CreditCard,
        type: "input",
        placeholder: "Bank routing number",
        description: "For direct deposit",
      },
      {
        name: "accountType" as const,
        label: "Account Type",
        icon: CreditCard,
        type: "select",
        options: [
          { value: "checking", label: "Checking" },
          { value: "savings", label: "Savings" },
        ],
        description: "Account type for direct deposit",
      },
      {
        name: "accountNumber" as const,
        label: "Account Number",
        icon: CreditCard,
        type: "input",
        placeholder: "Bank account number",
        description: "For direct deposit",
      },
    ],
  },
  {
    title: "Third Party Designee and Signature",
    icon: FileText,
    fields: [
      {
        name: "thirdPartyDesignee" as const,
        label: "Third Party Designee?",
        icon: Users,
        type: "select",
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ],
        description: "Do you want to allow another person to discuss this return with the IRS?",
      },
      {
        name: "taxpayerOccupation" as const,
        label: "Taxpayer Occupation",
        icon: Briefcase,
        type: "input",
        placeholder: "e.g., POTUS",
        description: "Primary taxpayer's occupation",
      },
      {
        name: "spouseOccupation" as const,
        label: "Spouse Occupation",
        icon: Briefcase,
        type: "input",
        placeholder: "Spouse's occupation",
        description: "Spouse's occupation (if applicable)",
      },
      {
        name: "daytimePhone" as const,
        label: "Daytime Phone",
        icon: Phone,
        type: "input",
        placeholder: "Daytime phone",
        description: "Daytime phone number",
      },
    ],
  },
]

export function TaxFormDynamic({ initialData, onSave, onNext }: TaxFormDynamicProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<TaxFormData>({
    resolver: zodResolver(taxFormSchema),
    defaultValues: initialData,
  })

  const onSubmit = async (data: TaxFormData) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      onSave(data)
      toast({
        title: "Tax form saved successfully",
        description: "Tax information has been updated correctly.",
      })
      // Scroll to top when proceeding to next step
      window.scrollTo({ top: 0, behavior: "smooth" })
      onNext()
    } catch (error) {
      toast({
        title: "Error saving",
        description: "There was a problem saving the tax data. Please try again.",
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
      form.setValue(key as keyof TaxFormData, initialData[key as keyof TaxFormData] || "")
    })
    toast({
      title: "Form reset",
      description: "Data has been restored to values extracted from the document.",
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Form 1040 - Tax Return 2017</CardTitle>
        <CardDescription>
          Review and modify information extracted from IRS Form 1040. Complete all required fields for your tax return.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {taxFieldSections.map((section, sectionIndex) => {
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
                                        <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
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
                Reset
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save and Continue
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
