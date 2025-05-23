"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RestaurantCard } from "@/components/restaurant-management-card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { CalendarDays, PlusCircle, Store, TrendingUp } from "lucide-react"
import { type Restaurant, restaurantsApi } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"

export function OwnerDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [todayReservations, setTodayReservations] = useState(0)
  const [totalReservations, setTotalReservations] = useState(0)

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setIsLoading(true)
        const data = await restaurantsApi.getOwnerRestaurants()
        setRestaurants(data)

        // Calculate total reservations across all restaurants
        // This assumes the restaurant data includes a reservationCount field
        // If not, you'll need to adjust this or fetch reservation counts separately
        const total = data.reduce((sum: number, restaurant: any) => {
          return sum + (restaurant.reservationCount || 0)
        }, 0)

        setTotalReservations(total)

        // For demo purposes, set today's reservations to a fraction of total
        // In a real app, you would fetch this from the API
        setTodayReservations(Math.floor(total * 0.2))
      } catch (error) {
        console.error("Failed to fetch restaurants:", error)
        toast({
          title: "Error",
          description: "Failed to load your restaurants. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchRestaurants()
  }, [toast])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Restaurant Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}. Manage your restaurants and reservations.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Restaurants</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{restaurants.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Reservations</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayReservations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReservations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Add Restaurant</CardTitle>
            <PlusCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">New Listing</div>
          </CardContent>
          <CardFooter className="p-2">
            <Link href="/dashboard/add-restaurant" className="w-full">
              <Button className="w-full">Add Restaurant</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Your Restaurants</h2>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <LoadingSpinner />
          </div>
        ) : restaurants.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <Store className="h-10 w-10 text-muted-foreground mb-4" />
              <CardDescription>You haven&apos;t added any restaurants yet.</CardDescription>
              <Link href="/dashboard/add-restaurant" className="mt-4">
                <Button>Add Your First Restaurant</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
