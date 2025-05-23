"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "./auth-provider"

export function MainNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/restaurants",
      label: "Restaurants",
      active: pathname === "/restaurants",
    },
  ]

  // Add dashboard link if user is logged in
  if (user) {
    routes.push({
      href: "/dashboard",
      label: "Dashboard",
      active: pathname === "/dashboard",
    })
  }

  return (
    <div className="mr-4 flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-teal-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
          <path d="M7 2v20" />
          <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
        </svg>
        <span className="font-bold text-xl">E-Table</span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "transition-colors hover:text-foreground/80",
              route.active ? "text-foreground" : "text-foreground/60",
            )}
          >
            {route.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
