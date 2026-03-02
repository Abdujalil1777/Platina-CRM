"use client"

import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import useSWR, { mutate } from "swr"
import { useState } from "react"
import {
  CreditCard,
  Plus,
  Search,
  X,
  Trash2,
  Loader2,
  Banknote,
  Calendar,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Student = { id: string; full_name: string; course: string }
type Payment = {
  id: string
  user_id: string
  student_id: string
  amount: number
  payment_date: string
  payment_method: string
  description: string | null
  status: string
  created_at: string
  students?: Student
}

const methodLabels: Record<string, string> = {
  cash: "Naqd",
  card: "Karta",
  transfer: "O'tkazma",
  other: "Boshqa",
}

const statusLabels: Record<string, string> = {
  paid: "To'langan",
  pending: "Kutilmoqda",
  cancelled: "Bekor qilingan",
}

const statusColors: Record<string, { bg: string; text: string }> = {
  paid: { bg: "oklch(0.72 0.19 155 / 0.15)", text: "oklch(0.72 0.19 155)" },
  pending: { bg: "oklch(0.82 0.17 80 / 0.15)", text: "oklch(0.82 0.17 80)" },
  cancelled: { bg: "oklch(0.65 0.2 25 / 0.15)", text: "oklch(0.65 0.2 25)" },
}

async function fetchPayments() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("payments")
    .select("*, students(id, full_name, course)")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data as Payment[]
}

async function fetchStudentsList() {
  const supabase = createClient()
  const { data } = await supabase.from("students").select("id, full_name, course").order("full_name")
  return data as Student[]
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

export default function PaymentsPage() {
  const { data: payments, isLoading } = useSWR("payments", fetchPayments)
  const { data: studentsList } = useSWR("students-list", fetchStudentsList)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalPaid = payments
    ?.filter((p) => p.status === "paid")
    .reduce((s, p) => s + Number(p.amount), 0) || 0

  const filtered = payments?.filter(
    (p) =>
      p.students?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      String(p.amount).includes(search)
  )

  const handleDelete = async (id: string) => {
    if (!confirm("Bu to'lovni o'chirishni xohlaysizmi?")) return
    const supabase = createClient()
    await supabase.from("payments").delete().eq("id", id)
    mutate("payments")
    mutate("dashboard")
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const form = new FormData(e.currentTarget)
    await supabase.from("payments").insert({
      user_id: user.id,
      student_id: form.get("student_id") as string,
      amount: Number(form.get("amount")),
      payment_date: (form.get("payment_date") as string) || new Date().toISOString().split("T")[0],
      payment_method: form.get("payment_method") as string,
      description: (form.get("description") as string) || null,
      status: form.get("status") as string,
    })

    setIsSubmitting(false)
    setShowForm(false)
    mutate("payments")
    mutate("dashboard")
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{"To'lovlar"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Jami: <span className="font-semibold text-foreground">{totalPaid.toLocaleString()} {"so'm"}</span>
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          {"To'lov qo'shish"}
        </motion.button>
      </motion.div>

      {/* Search */}
      <motion.div variants={item} className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="O'quvchi ismi yoki miqdor bo'yicha qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="glass-input h-12 rounded-xl pl-11 text-foreground placeholder:text-muted-foreground/50"
        />
      </motion.div>

      {/* Payments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (filtered?.length ?? 0) === 0 ? (
        <motion.div variants={item} className="glass rounded-2xl p-12 text-center">
          <Banknote className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-sm text-muted-foreground">
            {search ? "Natija topilmadi" : "Hali to'lovlar qo'shilmagan"}
          </p>
        </motion.div>
      ) : (
        <motion.div variants={item} className="flex flex-col gap-3">
          {filtered?.map((payment) => (
            <motion.div
              key={payment.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.005 }}
              className="glass rounded-2xl p-4"
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "oklch(0.82 0.14 90 / 0.15)" }}
                >
                  <CreditCard className="h-5 w-5" style={{ color: "oklch(0.82 0.14 90)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground truncate">
                      {payment.students?.full_name || "Noma'lum"}
                    </p>
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{
                        background: statusColors[payment.status]?.bg,
                        color: statusColors[payment.status]?.text,
                      }}
                    >
                      {statusLabels[payment.status]}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(payment.payment_date).toLocaleDateString("uz")}
                    </span>
                    <span>{methodLabels[payment.payment_method]}</span>
                    {payment.description && <span className="truncate">{payment.description}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-lg font-bold text-foreground whitespace-nowrap">
                    {Number(payment.amount).toLocaleString()} <span className="text-xs font-normal text-muted-foreground">{"so'm"}</span>
                  </p>
                  <button
                    onClick={() => handleDelete(payment.id)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="O'chirish"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
              onClick={() => setShowForm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              className="fixed inset-x-4 top-[10%] z-50 mx-auto max-h-[80vh] max-w-lg overflow-y-auto glass-strong rounded-3xl p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-foreground">{"Yangi to'lov"}</h2>
                <button onClick={() => setShowForm(false)} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground" aria-label="Yopish">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm text-foreground/80">{"O'quvchi *"}</Label>
                  <select
                    name="student_id"
                    required
                    className="glass-input h-11 rounded-xl px-3 text-sm text-foreground bg-transparent"
                  >
                    <option value="" className="bg-background text-foreground">{"O'quvchini tanlang"}</option>
                    {studentsList?.map((s) => (
                      <option key={s.id} value={s.id} className="bg-background text-foreground">
                        {s.full_name} - {s.course}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm text-foreground/80">{"Miqdor (so'm) *"}</Label>
                    <Input
                      name="amount"
                      type="number"
                      required
                      min="1"
                      placeholder="500000"
                      className="glass-input h-11 rounded-xl text-foreground placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm text-foreground/80">Sana</Label>
                    <Input
                      name="payment_date"
                      type="date"
                      defaultValue={new Date().toISOString().split("T")[0]}
                      className="glass-input h-11 rounded-xl text-foreground"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm text-foreground/80">{"To'lov usuli"}</Label>
                    <select name="payment_method" defaultValue="cash" className="glass-input h-11 rounded-xl px-3 text-sm text-foreground bg-transparent">
                      <option value="cash" className="bg-background text-foreground">Naqd</option>
                      <option value="card" className="bg-background text-foreground">Karta</option>
                      <option value="transfer" className="bg-background text-foreground">{"O'tkazma"}</option>
                      <option value="other" className="bg-background text-foreground">Boshqa</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm text-foreground/80">Holat</Label>
                    <select name="status" defaultValue="paid" className="glass-input h-11 rounded-xl px-3 text-sm text-foreground bg-transparent">
                      <option value="paid" className="bg-background text-foreground">{"To'langan"}</option>
                      <option value="pending" className="bg-background text-foreground">Kutilmoqda</option>
                      <option value="cancelled" className="bg-background text-foreground">Bekor qilingan</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm text-foreground/80">Izoh</Label>
                  <Input
                    name="description"
                    placeholder="Mart oyi uchun to'lov"
                    className="glass-input h-11 rounded-xl text-foreground placeholder:text-muted-foreground/50"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-medium text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
                >
                  {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Saqlanmoqda...</> : "To'lovni qo'shish"}
                </motion.button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
