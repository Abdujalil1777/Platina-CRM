"use client"

import { motion } from "framer-motion"
import {
  Users,
  CreditCard,
  TrendingUp,
  CheckSquare,
  GraduationCap,
  Clock,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import useSWR from "swr"
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
  AreaChart,
  Area,
} from "recharts"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

const COLORS = [
  "oklch(0.75 0.15 200)",
  "oklch(0.78 0.12 170)",
  "oklch(0.7 0.18 280)",
  "oklch(0.82 0.14 90)",
]

async function fetchDashboardData() {
  const supabase = createClient()

  const [studentsRes, paymentsRes, tasksRes] = await Promise.all([
    supabase.from("students").select("*"),
    supabase.from("payments").select("*"),
    supabase.from("tasks").select("*"),
  ])

  const students = studentsRes.data || []
  const payments = paymentsRes.data || []
  const tasks = tasksRes.data || []

  const activeStudents = students.filter((s) => s.status === "active").length
  const totalPayments = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amount), 0)
  const pendingTasks = tasks.filter((t) => t.status === "pending").length
  const completedTasks = tasks.filter((t) => t.status === "completed").length

  // Course distribution
  const courseMap = new Map<string, number>()
  students.forEach((s) => {
    courseMap.set(s.course, (courseMap.get(s.course) || 0) + 1)
  })
  const courseData = Array.from(courseMap, ([name, value]) => ({ name, value }))

  // Monthly payments (last 6 months)
  const monthlyPayments = []
  const months = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"]
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthPayments = payments.filter((p) => {
      const pd = new Date(p.payment_date)
      return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear() && p.status === "paid"
    })
    monthlyPayments.push({
      name: months[d.getMonth()],
      amount: monthPayments.reduce((s, p) => s + Number(p.amount), 0),
    })
  }

  // Status distribution
  const statusData = [
    { name: "Faol", value: students.filter((s) => s.status === "active").length },
    { name: "Tugatgan", value: students.filter((s) => s.status === "completed").length },
    { name: "To'xtatilgan", value: students.filter((s) => s.status === "paused").length },
    { name: "Chiqib ketgan", value: students.filter((s) => s.status === "dropped").length },
  ].filter((d) => d.value > 0)

  return {
    totalStudents: students.length,
    activeStudents,
    totalPayments,
    pendingTasks,
    completedTasks,
    totalTasks: tasks.length,
    courseData,
    monthlyPayments,
    statusData,
    recentStudents: students.slice(-5).reverse(),
  }
}

export default function DashboardPage() {
  const { data, isLoading } = useSWR("dashboard", fetchDashboardData, {
    refreshInterval: 30000,
  })

  const stats = [
    {
      label: "Jami o'quvchilar",
      value: data?.totalStudents ?? 0,
      icon: Users,
      color: "oklch(0.75 0.15 200)",
    },
    {
      label: "Faol o'quvchilar",
      value: data?.activeStudents ?? 0,
      icon: GraduationCap,
      color: "oklch(0.78 0.12 170)",
    },
    {
      label: "Jami to'lovlar",
      value: `${(data?.totalPayments ?? 0).toLocaleString()} so'm`,
      icon: CreditCard,
      color: "oklch(0.82 0.14 90)",
    },
    {
      label: "Kutilayotgan vazifalar",
      value: data?.pendingTasks ?? 0,
      icon: CheckSquare,
      color: "oklch(0.7 0.18 280)",
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-6">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platina {"O'quv Markazi"} - umumiy ko{"'"}rinish
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              variants={item}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: `${stat.color}20` }}
                >
                  <Icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" style={{ color: stat.color }} />
                <span>Yangilangan</span>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Payments Chart */}
        <motion.div variants={item} className="glass rounded-2xl p-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Oylik to{"'"}lovlar</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.monthlyPayments || []}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.75 0.15 200)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.75 0.15 200)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.98 0 0 / 0.06)" />
                <XAxis dataKey="name" tick={{ fill: "oklch(0.75 0 0)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "oklch(0.75 0 0)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.2 0.02 260 / 0.9)",
                    border: "1px solid oklch(0.98 0 0 / 0.15)",
                    borderRadius: "12px",
                    backdropFilter: "blur(20px)",
                    color: "oklch(0.98 0 0)",
                  }}
                  formatter={(value: number) => [`${value.toLocaleString()} so'm`, "To'lov"]}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="oklch(0.75 0.15 200)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Student Status Pie */}
        <motion.div variants={item} className="glass rounded-2xl p-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">{"O'quvchilar holati"}</h3>
          {(data?.statusData?.length ?? 0) > 0 ? (
            <div className="flex h-64 items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data?.statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.2 0.02 260 / 0.9)",
                      border: "1px solid oklch(0.98 0 0 / 0.15)",
                      borderRadius: "12px",
                      backdropFilter: "blur(20px)",
                      color: "oklch(0.98 0 0)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              {"Hali o'quvchilar qo'shilmagan"}
            </div>
          )}
          {(data?.statusData?.length ?? 0) > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {data?.statusData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  {d.name}: {d.value}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Course Distribution & Recent Students */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Course bar chart */}
        <motion.div variants={item} className="glass rounded-2xl p-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Kurslar bo{"'"}yicha taqsimot</h3>
          {(data?.courseData?.length ?? 0) > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.courseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.98 0 0 / 0.06)" />
                  <XAxis dataKey="name" tick={{ fill: "oklch(0.75 0 0)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "oklch(0.75 0 0)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.2 0.02 260 / 0.9)",
                      border: "1px solid oklch(0.98 0 0 / 0.15)",
                      borderRadius: "12px",
                      color: "oklch(0.98 0 0)",
                    }}
                  />
                  <Bar dataKey="value" fill="oklch(0.75 0.15 200)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              {"Hali kurslar qo'shilmagan"}
            </div>
          )}
        </motion.div>

        {/* Recent students */}
        <motion.div variants={item} className="glass rounded-2xl p-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">So{"'"}nggi o{"'"}quvchilar</h3>
          {(data?.recentStudents?.length ?? 0) > 0 ? (
            <div className="flex flex-col gap-3">
              {data?.recentStudents.map((student) => (
                <div key={student.id} className="flex items-center gap-3 glass-subtle rounded-xl p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "oklch(0.75 0.15 200 / 0.15)" }}>
                    <Users className="h-4 w-4" style={{ color: "oklch(0.75 0.15 200)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{student.full_name}</p>
                    <p className="text-xs text-muted-foreground">{student.course}</p>
                  </div>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[10px] font-medium"
                    style={{
                      background: student.status === 'active' ? 'oklch(0.72 0.19 155 / 0.15)' : 'oklch(0.82 0.17 80 / 0.15)',
                      color: student.status === 'active' ? 'oklch(0.72 0.19 155)' : 'oklch(0.82 0.17 80)',
                    }}
                  >
                    {student.status === 'active' ? 'Faol' : student.status === 'completed' ? 'Tugatgan' : student.status === 'paused' ? "To'xtatilgan" : 'Chiqib ketgan'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
              <Clock className="h-8 w-8 opacity-40" />
              {"Hali o'quvchilar qo'shilmagan"}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
