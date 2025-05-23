"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { RestaurantCard } from "@/components/restaurant-management-card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Card, CardContent, CardDescription } from "@/components/ui/card"
import { PlusCircle, Store } from "lucide-react"
import { type Restaurant, restaurantsApi } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"

export default function RestaurantsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setIsLoading(true)
        const data = await restaurantsApi.getOwnerRestaurants()
        setRestaurants(data)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Restaurants</h1>
          <p className="text-muted-foreground">Manage your restaurant listings and reservations.</p>
        </div>
        <Link href="/dashboard/add-restaurant">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Restaurant
          </Button>
        </Link>
      </div>

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
  )
}
