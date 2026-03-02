"use client"

import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import useSWR, { mutate } from "swr"
import { useState } from "react"
import {
  CheckSquare,
  Plus,
  X,
  Trash2,
  Loader2,
  Circle,
  CheckCircle2,
  Clock,
  AlertCircle,
  Flag,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Task = {
  id: string
  user_id: string
  title: string
  description: string | null
  priority: "low" | "medium" | "high" | "urgent"
  status: "pending" | "in_progress" | "completed" | "cancelled"
  due_date: string | null
  created_at: string
}

const statusConfig: Record<string, { label: string; icon: typeof Circle; color: string }> = {
  pending: { label: "Kutilmoqda", icon: Circle, color: "oklch(0.82 0.17 80)" },
  in_progress: { label: "Bajarilmoqda", icon: Clock, color: "oklch(0.75 0.15 200)" },
  completed: { label: "Bajarildi", icon: CheckCircle2, color: "oklch(0.72 0.19 155)" },
  cancelled: { label: "Bekor qilingan", icon: AlertCircle, color: "oklch(0.65 0.2 25)" },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Past", color: "oklch(0.75 0 0)" },
  medium: { label: "O'rta", color: "oklch(0.82 0.17 80)" },
  high: { label: "Yuqori", color: "oklch(0.72 0.2 30)" },
  urgent: { label: "Shoshilinch", color: "oklch(0.65 0.2 25)" },
}

async function fetchTasks() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data as Task[]
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

export default function TasksPage() {
  const { data: tasks, isLoading } = useSWR("tasks", fetchTasks)
  const [filter, setFilter] = useState<string>("all")
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filtered = tasks?.filter((t) => filter === "all" || t.status === filter)
  const counts = {
    all: tasks?.length ?? 0,
    pending: tasks?.filter((t) => t.status === "pending").length ?? 0,
    in_progress: tasks?.filter((t) => t.status === "in_progress").length ?? 0,
    completed: tasks?.filter((t) => t.status === "completed").length ?? 0,
  }

  const handleStatusChange = async (id: string, status: string) => {
    const supabase = createClient()
    await supabase.from("tasks").update({ status, updated_at: new Date().toISOString() }).eq("id", id)
    mutate("tasks")
    mutate("dashboard")
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bu vazifani o'chirishni xohlaysizmi?")) return
    const supabase = createClient()
    await supabase.from("tasks").delete().eq("id", id)
    mutate("tasks")
    mutate("dashboard")
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const form = new FormData(e.currentTarget)
    await supabase.from("tasks").insert({
      user_id: user.id,
      title: form.get("title") as string,
      description: (form.get("description") as string) || null,
      priority: form.get("priority") as string,
      due_date: (form.get("due_date") as string) || null,
    })

    setIsSubmitting(false)
    setShowForm(false)
    mutate("tasks")
    mutate("dashboard")
  }

  const filterTabs = [
    { key: "all", label: "Hammasi" },
    { key: "pending", label: "Kutilmoqda" },
    { key: "in_progress", label: "Bajarilmoqda" },
    { key: "completed", label: "Bajarildi" },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vazifalar</h1>
          <p className="mt-1 text-sm text-muted-foreground">{counts.all} ta vazifa</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          {"Vazifa qo'shish"}
        </motion.button>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div variants={item} className="flex gap-2 overflow-x-auto pb-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`relative shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              filter === tab.key ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {filter === tab.key && (
              <motion.div
                layoutId="activeFilter"
                className="absolute inset-0 rounded-xl glass-strong"
                style={{ background: "oklch(0.75 0.15 200 / 0.12)" }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              />
            )}
            <span className="relative z-10">
              {tab.label} ({counts[tab.key as keyof typeof counts] ?? 0})
            </span>
          </button>
        ))}
      </motion.div>

      {/* Tasks List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (filtered?.length ?? 0) === 0 ? (
        <motion.div variants={item} className="glass rounded-2xl p-12 text-center">
          <CheckSquare className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-sm text-muted-foreground">Vazifalar topilmadi</p>
        </motion.div>
      ) : (
        <motion.div variants={item} className="flex flex-col gap-3">
          {filtered?.map((task) => {
            const sConfig = statusConfig[task.status]
            const pConfig = priorityConfig[task.priority]
            const StatusIcon = sConfig.icon
            const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed"

            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.005 }}
                className="glass rounded-2xl p-4"
              >
                <div className="flex items-start gap-3">
                  {/* Status toggle */}
                  <button
                    onClick={() =>
                      handleStatusChange(
                        task.id,
                        task.status === "completed" ? "pending" : task.status === "pending" ? "in_progress" : "completed"
                      )
                    }
                    className="mt-0.5 shrink-0 transition-all hover:scale-110"
                    aria-label="Holatni o'zgartirish"
                  >
                    <StatusIcon className="h-5 w-5" style={{ color: sConfig.color }} />
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-foreground ${task.status === "completed" ? "line-through opacity-60" : ""}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{ background: `${pConfig.color}20`, color: pConfig.color }}
                      >
                        <Flag className="h-2.5 w-2.5" />
                        {pConfig.label}
                      </span>
                      {task.due_date && (
                        <span
                          className="flex items-center gap-1 text-[10px] font-medium"
                          style={{ color: isOverdue ? "oklch(0.65 0.2 25)" : "oklch(0.75 0 0)" }}
                        >
                          <Clock className="h-2.5 w-2.5" />
                          {new Date(task.due_date).toLocaleDateString("uz")}
                          {isOverdue && " (muddat o'tgan)"}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(task.id)}
                    className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="O'chirish"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            )
          })}
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
              className="fixed inset-x-4 top-[15%] z-50 mx-auto max-w-lg glass-strong rounded-3xl p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-foreground">Yangi vazifa</h2>
                <button onClick={() => setShowForm(false)} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground" aria-label="Yopish">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm text-foreground/80">Sarlavha *</Label>
                  <Input
                    name="title"
                    required
                    placeholder="Vazifa nomi"
                    className="glass-input h-11 rounded-xl text-foreground placeholder:text-muted-foreground/50"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm text-foreground/80">Tavsif</Label>
                  <textarea
                    name="description"
                    placeholder="Batafsil ma'lumot..."
                    rows={3}
                    className="glass-input rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm text-foreground/80">Muhimlik</Label>
                    <select name="priority" defaultValue="medium" className="glass-input h-11 rounded-xl px-3 text-sm text-foreground bg-transparent">
                      <option value="low" className="bg-background text-foreground">Past</option>
                      <option value="medium" className="bg-background text-foreground">{"O'rta"}</option>
                      <option value="high" className="bg-background text-foreground">Yuqori</option>
                      <option value="urgent" className="bg-background text-foreground">Shoshilinch</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm text-foreground/80">Muddat</Label>
                    <Input
                      name="due_date"
                      type="date"
                      className="glass-input h-11 rounded-xl text-foreground"
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-medium text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
                >
                  {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Saqlanmoqda...</> : "Vazifa qo'shish"}
                </motion.button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
