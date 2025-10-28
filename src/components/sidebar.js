"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, Target, User } from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/agent-details", label: "Agent Details", icon: Users },
    { href: "/attendance-targets", label: "Attendance Targets", icon: Target },
    { href: "/agent-view", label: "Agent View", icon: User },
  ]

  return (
    <div className="w-64 bg-card border-r border-border h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-xl font-bold text-foreground">Firebase Dashboard</h1>
      </div>
      <nav className="px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
