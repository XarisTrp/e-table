"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { CalendarDays, Edit, MapPin, Trash } from "lucide-react"
import { type Restaurant, restaurantsApi } from "@/lib/api-service"

interface RestaurantCardProps {
  restaurant: Restaurant & { reservationCount?: number }
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleDeleteRestaurant = async () => {
    setIsLoading(true)
    try {
      await restaurantsApi.delete(restaurant.id)
      toast({
        title: "Restaurant deleted",
        description: "Your restaurant has been successfully removed.",
      })
      // Refresh the page to update the list
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete your restaurant. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={restaurant.image || "/placeholder.svg?height=300&width=400"}
          alt={restaurant.name}
          className="h-full w-full object-cover"
        />
      </div>
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{restaurant.name}</CardTitle>
          <Badge variant="outline" className="bg-teal-50 text-teal-700 dark:bg-teal-900 dark:text-teal-300">
            {restaurant.cuisine}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        <div className="flex items-center text-sm">
          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{restaurant.location}</span>
        </div>
        <div className="flex items-center text-sm">
          <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{restaurant.reservationCount || 0} reservations</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 flex flex-wrap gap-2">
        <Link href={`/dashboard/restaurants/${restaurant.id}`} className="flex-1">
          <Button variant="default" size="sm" className="w-full">
            Manage
          </Button>
        </Link>
        <Link href={`/dashboard/restaurants/${restaurant.id}/edit`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </Link>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="flex-1" disabled={isLoading}>
              <Trash className="mr-2 h-4 w-4" />
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Restaurant</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {restaurant.name}? This action cannot be undone and will cancel all
                existing reservations.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteRestaurant}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}
