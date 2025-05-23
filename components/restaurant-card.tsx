import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"

interface Restaurant {
  id: string
  name: string
  cuisine: string
  image: string
  rating: number
  totalSeats: number
  location: string
}

interface RestaurantCardProps {
  restaurant: Restaurant
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={restaurant.image || "/placeholder.svg"}
          alt={restaurant.name}
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold">{restaurant.name}</h3>
            <p className="text-sm text-muted-foreground">{restaurant.location}</p>
          </div>
          <Badge variant="outline" className="bg-teal-50 text-teal-700 dark:bg-teal-900 dark:text-teal-300">
            {restaurant.cuisine}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{restaurant.rating}</span>
          <span className="text-sm text-muted-foreground">• {restaurant.totalSeats} seats</span>
        </div>
      </CardContent>
      <CardFooter className="p-4">
        <Link href={`/restaurants/${restaurant.id}`} className="w-full">
          <Button variant="default" className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
