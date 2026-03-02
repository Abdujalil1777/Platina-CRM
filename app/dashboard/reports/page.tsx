"use client"

import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import useSWR from "swr"
import { Loader2, TrendingUp, Users, CreditCard, CheckSquare, Calendar } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts"

const COLORS = [
  "oklch(0.75 0.15 200)",
  "oklch(0.78 0.12 170)",
  "oklch(0.7 0.18 280)",
  "oklch(0.82 0.14 90)",
  "oklch(0.72 0.2 330)",
]

const tooltipStyle = {
  background: "oklch(0.2 0.02 260 / 0.9)",
  border: "1px solid oklch(0.98 0 0 / 0.15)",
  borderRadius: "12px",
  color: "oklch(0.98 0 0)",
}

async function fetchReportData() {
  const supabase = createClient()
  const [studentsRes, paymentsRes, tasksRes] = await Promise.all([
    supabase.from("students").select("*"),
    supabase.from("payments").select("*"),
    supabase.from("tasks").select("*"),
  ])

  const students = studentsRes.data || []
  const payments = paymentsRes.data || []
  const tasks = tasksRes.data || []

  // Monthly revenue (12 months)
  const months = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"]
  const now = new Date()
  const monthlyRevenue = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const mPayments = payments.filter((p) => {
      const pd = new Date(p.payment_date)
      return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear() && p.status === "paid"
    })
    const mStudents = students.filter((s) => {
      const sd = new Date(s.created_at)
      return sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear()
    })
    monthlyRevenue.push({
      name: months[d.getMonth()],
      revenue: mPayments.reduce((s, p) => s + Number(p.amount), 0),
      students: mStudents.length,
    })
  }

  // Course distribution
  const courseMap = new Map<string, { students: number; revenue: number }>()
  students.forEach((s) => {
    const existing = courseMap.get(s.course) || { students: 0, revenue: 0 }
    existing.students += 1
    courseMap.set(s.course, existing)
  })
  payments.forEach((p) => {
    if (p.status !== "paid") return
    const student = students.find((s) => s.id === p.student_id)
    if (student) {
      const existing = courseMap.get(student.course) || { students: 0, revenue: 0 }
      existing.revenue += Number(p.amount)
      courseMap.set(student.course, existing)
    }
  })
  const courseData = Array.from(courseMap, ([name, data]) => ({ name, ...data }))

  // Payment methods
  const methodMap = new Map<string, number>()
  const methodLabels: Record<string, string> = { cash: "Naqd", card: "Karta", transfer: "O'tkazma", other: "Boshqa" }
  payments.filter((p) => p.status === "paid").forEach((p) => {
    const label = methodLabels[p.payment_method] || p.payment_method
    methodMap.set(label, (methodMap.get(label) || 0) + Number(p.amount))
  })
  const methodData = Array.from(methodMap, ([name, value]) => ({ name, value }))

  // Task stats
  const taskStats = [
    { name: "Kutilmoqda", value: tasks.filter((t) => t.status === "pending").length },
    { name: "Bajarilmoqda", value: tasks.filter((t) => t.status === "in_progress").length },
    { name: "Bajarildi", value: tasks.filter((t) => t.status === "completed").length },
    { name: "Bekor qilingan", value: tasks.filter((t) => t.status === "cancelled").length },
  ].filter((d) => d.value > 0)

  // Summary stats
  const totalRevenue = payments.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0)
  const avgPerStudent = students.length > 0 ? Math.round(totalRevenue / students.length) : 0

  return {
    monthlyRevenue,
    courseData,
    methodData,
    taskStats,
    summary: {
      totalStudents: students.length,
      activeStudents: students.filter((s) => s.status === "active").length,
      totalRevenue,
      avgPerStudent,
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.status === "completed").length,
      totalPayments: payments.length,
    },
  }
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export default function ReportsPage() {
  const { data, isLoading } = useSWR("reports", fetchReportData, { refreshInterval: 60000 })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Hisobotlar yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  const summaryCards = [
    {
      label: "Jami daromad",
      value: `${(data?.summary.totalRevenue ?? 0).toLocaleString()} so'm`,
      icon: TrendingUp,
      color: "oklch(0.72 0.19 155)",
    },
    {
      label: "O'rtacha to'lov / o'quvchi",
      value: `${(data?.summary.avgPerStudent ?? 0).toLocaleString()} so'm`,
      icon: CreditCard,
      color: "oklch(0.75 0.15 200)",
    },
    {
      label: "Faol o'quvchilar",
      value: `${data?.summary.activeStudents ?? 0} / ${data?.summary.totalStudents ?? 0}`,
      icon: Users,
      color: "oklch(0.78 0.12 170)",
    },
    {
      label: "Bajarilgan vazifalar",
      value: `${data?.summary.completedTasks ?? 0} / ${data?.summary.totalTasks ?? 0}`,
      icon: CheckSquare,
      color: "oklch(0.7 0.18 280)",
    },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-6">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-foreground">Hisobotlar</h1>
        <p className="mt-1 text-sm text-muted-foreground">Batafsil analitika va statistika</p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              whileHover={{ scale: 1.02, y: -2 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                  <p className="mt-2 text-xl font-bold text-foreground">{card.value}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${card.color}20` }}>
                  <Icon className="h-5 w-5" style={{ color: card.color }} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Revenue Over Time */}
      <motion.div variants={item} className="glass rounded-2xl p-6">
        <h3 className="mb-1 text-sm font-semibold text-foreground">Oylik daromad va o{"'"}quvchilar</h3>
        <p className="mb-4 text-xs text-muted-foreground">Oxirgi 12 oy statistikasi</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.monthlyRevenue || []}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.75 0.15 200)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.75 0.15 200)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.98 0 0 / 0.06)" />
              <XAxis dataKey="name" tick={{ fill: "oklch(0.75 0 0)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: "oklch(0.75 0 0)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "oklch(0.75 0 0)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area yAxisId="left" type="monotone" dataKey="revenue" name="Daromad" stroke="oklch(0.75 0.15 200)" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              <Line yAxisId="right" type="monotone" dataKey="students" name="Yangi o'quvchilar" stroke="oklch(0.78 0.12 170)" strokeWidth={2} dot={{ r: 4, fill: "oklch(0.78 0.12 170)" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Course Revenue & Payment Methods */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div variants={item} className="glass rounded-2xl p-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Kurslar bo{"'"}yicha daromad</h3>
          {(data?.courseData?.length ?? 0) > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.courseData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.98 0 0 / 0.06)" />
                  <XAxis type="number" tick={{ fill: "oklch(0.75 0 0)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "oklch(0.75 0 0)", fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="revenue" name="Daromad" fill="oklch(0.75 0.15 200)" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              {"Ma'lumotlar hali yo'q"}
            </div>
          )}
        </motion.div>

        <motion.div variants={item} className="glass rounded-2xl p-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">{"To'lov usullari"}</h3>
          {(data?.methodData?.length ?? 0) > 0 ? (
            <div className="flex h-64 items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data?.methodData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={5} dataKey="value">
                    {data?.methodData.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value.toLocaleString()} so'm`]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              {"Ma'lumotlar hali yo'q"}
            </div>
          )}
          {(data?.methodData?.length ?? 0) > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {data?.methodData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  {d.name}: {d.value.toLocaleString()} {"so'm"}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Tasks Stats */}
      <motion.div variants={item} className="glass rounded-2xl p-6">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Vazifalar holati</h3>
        {(data?.taskStats?.length ?? 0) > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {data?.taskStats.map((stat, i) => (
              <div key={stat.name} className="glass-subtle rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <p className="text-xs text-muted-foreground">{stat.name}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            Vazifalar hali qo{"'"}shilmagan
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
