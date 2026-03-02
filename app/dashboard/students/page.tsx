"use client"

import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import useSWR, { mutate } from "swr"
import { useState } from "react"
import {
  Users,
  Plus,
  Search,
  X,
  Edit3,
  Trash2,
  Phone,
  Mail,
  BookOpen,
  Loader2,
  UserPlus,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Student = {
  id: string
  user_id: string
  full_name: string
  phone: string | null
  email: string | null
  course: string
  group_name: string | null
  status: "active" | "completed" | "paused" | "dropped"
  start_date: string | null
  end_date: string | null
  notes: string | null
  created_at: string
}

const statusLabels: Record<string, string> = {
  active: "Faol",
  completed: "Tugatgan",
  paused: "To'xtatilgan",
  dropped: "Chiqib ketgan",
}

const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: "oklch(0.72 0.19 155 / 0.15)", text: "oklch(0.72 0.19 155)" },
  completed: { bg: "oklch(0.75 0.15 200 / 0.15)", text: "oklch(0.75 0.15 200)" },
  paused: { bg: "oklch(0.82 0.17 80 / 0.15)", text: "oklch(0.82 0.17 80)" },
  dropped: { bg: "oklch(0.65 0.2 25 / 0.15)", text: "oklch(0.65 0.2 25)" },
}

async function fetchStudents() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
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

export default function StudentsPage() {
  const { data: students, isLoading } = useSWR("students", fetchStudents)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editStudent, setEditStudent] = useState<Student | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filtered = students?.filter(
    (s) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.course.toLowerCase().includes(search.toLowerCase()) ||
      s.phone?.includes(search) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm("Bu o'quvchini o'chirishni xohlaysizmi?")) return
    const supabase = createClient()
    await supabase.from("students").delete().eq("id", id)
    mutate("students")
    mutate("dashboard")
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const form = new FormData(e.currentTarget)
    const payload = {
      full_name: form.get("full_name") as string,
      phone: (form.get("phone") as string) || null,
      email: (form.get("email") as string) || null,
      course: form.get("course") as string,
      group_name: (form.get("group_name") as string) || null,
      status: (form.get("status") as string) || "active",
      start_date: (form.get("start_date") as string) || null,
      notes: (form.get("notes") as string) || null,
      user_id: user.id,
    }

    if (editStudent) {
      await supabase.from("students").update(payload).eq("id", editStudent.id)
    } else {
      await supabase.from("students").insert(payload)
    }

    setIsSubmitting(false)
    setShowForm(false)
    setEditStudent(null)
    mutate("students")
    mutate("dashboard")
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{"O'quvchilar"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {students?.length ?? 0} ta o{"'"}quvchi ro{"'"}yxatda
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setEditStudent(null); setShowForm(true) }}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          {"O'quvchi qo'shish"}
        </motion.button>
      </motion.div>

      {/* Search */}
      <motion.div variants={item} className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Ism, kurs, telefon yoki email bo'yicha qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="glass-input h-12 rounded-xl pl-11 text-foreground placeholder:text-muted-foreground/50"
        />
      </motion.div>

      {/* Students List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (filtered?.length ?? 0) === 0 ? (
        <motion.div variants={item} className="glass rounded-2xl p-12 text-center">
          <UserPlus className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-sm text-muted-foreground">
            {search ? "Natija topilmadi" : "Hali o'quvchilar qo'shilmagan"}
          </p>
          {!search && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {"Birinchi o'quvchini qo'shing"}
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div variants={item} className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered?.map((student) => (
            <motion.div
              key={student.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ scale: 1.01, y: -2 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold"
                    style={{ background: "oklch(0.75 0.15 200 / 0.15)", color: "oklch(0.75 0.15 200)" }}
                  >
                    {student.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{student.full_name}</p>
                    <span
                      className="mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{
                        background: statusColors[student.status]?.bg,
                        color: statusColors[student.status]?.text,
                      }}
                    >
                      {statusLabels[student.status]}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => { setEditStudent(student); setShowForm(true) }}
                    className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Tahrirlash"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(student.id)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="O'chirish"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5" />
                  {student.course} {student.group_name && `- ${student.group_name}`}
                </div>
                {student.phone && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    {student.phone}
                  </div>
                )}
                {student.email && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    {student.email}
                  </div>
                )}
              </div>

              {student.notes && (
                <p className="mt-3 text-xs text-muted-foreground/70 line-clamp-2 glass-subtle rounded-lg p-2">
                  {student.notes}
                </p>
              )}
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
              onClick={() => { setShowForm(false); setEditStudent(null) }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              className="fixed inset-x-4 top-[10%] z-50 mx-auto max-h-[80vh] max-w-lg overflow-y-auto glass-strong rounded-3xl p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-foreground">
                  {editStudent ? "O'quvchini tahrirlash" : "Yangi o'quvchi"}
                </h2>
                <button
                  onClick={() => { setShowForm(false); setEditStudent(null) }}
                  className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground"
                  aria-label="Yopish"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm text-foreground/80">To&apos;liq ism *</Label>
                  <Input
                    name="full_name"
                    required
                    defaultValue={editStudent?.full_name || ""}
                    placeholder="Ism familiya"
                    className="glass-input h-11 rounded-xl text-foreground placeholder:text-muted-foreground/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm text-foreground/80">Telefon</Label>
                    <Input
                      name="phone"
                      defaultValue={editStudent?.phone || ""}
                      placeholder="+998 90 123 45 67"
                      className="glass-input h-11 rounded-xl text-foreground placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm text-foreground/80">Email</Label>
                    <Input
                      name="email"
                      type="email"
                      defaultValue={editStudent?.email || ""}
                      placeholder="email@mail.com"
                      className="glass-input h-11 rounded-xl text-foreground placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm text-foreground/80">Kurs *</Label>
                    <Input
                      name="course"
                      required
                      defaultValue={editStudent?.course || ""}
                      placeholder="Ingliz tili"
                      className="glass-input h-11 rounded-xl text-foreground placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm text-foreground/80">Guruh</Label>
                    <Input
                      name="group_name"
                      defaultValue={editStudent?.group_name || ""}
                      placeholder="A-1"
                      className="glass-input h-11 rounded-xl text-foreground placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm text-foreground/80">Holat</Label>
                    <select
                      name="status"
                      defaultValue={editStudent?.status || "active"}
                      className="glass-input h-11 rounded-xl px-3 text-sm text-foreground bg-transparent"
                    >
                      <option value="active" className="bg-background text-foreground">Faol</option>
                      <option value="completed" className="bg-background text-foreground">Tugatgan</option>
                      <option value="paused" className="bg-background text-foreground">{"To'xtatilgan"}</option>
                      <option value="dropped" className="bg-background text-foreground">Chiqib ketgan</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm text-foreground/80">Boshlangan sana</Label>
                    <Input
                      name="start_date"
                      type="date"
                      defaultValue={editStudent?.start_date || ""}
                      className="glass-input h-11 rounded-xl text-foreground"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm text-foreground/80">Izohlar</Label>
                  <textarea
                    name="notes"
                    defaultValue={editStudent?.notes || ""}
                    placeholder="Qo'shimcha ma'lumotlar..."
                    rows={3}
                    className="glass-input rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-medium text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Saqlanmoqda...</>
                  ) : editStudent ? "Saqlash" : "Qo'shish"}
                </motion.button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
