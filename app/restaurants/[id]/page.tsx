"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { format, addDays } from "date-fns"
import { CalendarIcon, Clock, MapPin, Star, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { LoadingSpinner } from "@/components/loading-spinner"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { type Restaurant, type TimeSlot, restaurantsApi, reservationsApi } from "@/lib/api-service"

export default function RestaurantPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [date, setDate] = useState<Date>(new Date())
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [partySize, setPartySize] = useState<string>("2")
  const [isReservationLoading, setIsReservationLoading] = useState(false)
  const [isReservationDialogOpen, setIsReservationDialogOpen] = useState(false)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number | null>(null)

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setIsLoading(true)
        const data = await restaurantsApi.getById(params.id as string)
        setRestaurant(data)
      } catch (error) {
        console.error("Failed to fetch restaurant:", error)
        toast({
          title: "Error",
          description: "Failed to load restaurant details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchRestaurant()
  }, [params.id, toast])

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!restaurant) return

      try {
        const formattedDate = format(date, "yyyy-MM-dd")
        const availableSlots = await restaurantsApi.getAvailability(restaurant.id, formattedDate)
        setTimeSlots(availableSlots)
      } catch (error) {
        console.error("Failed to fetch availability:", error)
        toast({
          title: "Error",
          description: "Failed to load availability. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchAvailability()
  }, [restaurant, date, toast])

  const handleReservation = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to make a reservation.",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    if (user.role === "OWNER") {
      toast({
        title: "Not allowed",
        description: "Restaurant owners cannot make reservations. Please use a customer account.",
        variant: "destructive",
      })
      return
    }

    if (selectedTimeSlot === null) {
      toast({
        title: "Time slot required",
        description: "Please select a time slot for your reservation.",
        variant: "destructive",
      })
      return
    }

    setIsReservationLoading(true)

    try {
      await reservationsApi.create({
        restaurantId: params.id as string,
        date: format(date, "yyyy-MM-dd"),
        time_slot: selectedTimeSlot,
        partySize: Number.parseInt(partySize),
      })

      toast({
        title: "Reservation confirmed",
        description: `Your table at ${restaurant?.name} has been reserved.`,
      })
      setIsReservationDialogOpen(false)
      router.push("/dashboard/reservations")
    } catch (error) {
      console.error("Reservation error:", error)
      toast({
        title: "Error",
        description: "Failed to make your reservation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsReservationLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Restaurant not found</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <MainNav />
        </div>
      </header>
      <main className="flex-1">
        <div className="relative h-[300px] md:h-[400px] lg:h-[500px] w-full overflow-hidden">
          <img
            src={restaurant.image || "/placeholder.svg?height=500&width=1000"}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="container">
              <Badge className="mb-2 bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300">
                {restaurant.cuisine}
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">{restaurant.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-white">
                <div className="flex items-center">
                  <MapPin className="mr-1 h-4 w-4" />
                  <span>{restaurant.address}</span>
                </div>
                <div className="flex items-center">
                  <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{restaurant.rating} rating</span>
                </div>
                <div className="flex items-center">
                  <Users className="mr-1 h-4 w-4" />
                  <span>{restaurant.totalSeats} seats</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>
                    {format(new Date(`2000-01-01T${restaurant.openingTime}`), "h:mm a")} -
                    {format(new Date(`2000-01-01T${restaurant.closingTime}`), "h:mm a")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-8 md:py-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Tabs defaultValue="about" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="menu">Menu</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
                <TabsContent value="about" className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-4">About {restaurant.name}</h2>
                    <p className="text-muted-foreground">{restaurant.description}</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Location</h3>
                    <div className="aspect-video bg-muted rounded-md overflow-hidden">
                      <img
                        src="/placeholder.svg?height=400&width=800&text=Map"
                        alt="Restaurant location map"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="menu" className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Menu</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardContent className="p-6">
                          <h3 className="text-xl font-semibold mb-4">Appetizers</h3>
                          <ul className="space-y-4">
                            <li className="border-b pb-4">
                              <div className="flex justify-between">
                                <div>
                                  <h4 className="font-medium">Bruschetta</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Toasted bread topped with tomatoes, garlic, and basil
                                  </p>
                                </div>
                                <div className="font-medium">$8</div>
                              </div>
                            </li>
                            <li className="border-b pb-4">
                              <div className="flex justify-between">
                                <div>
                                  <h4 className="font-medium">Caprese Salad</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Fresh mozzarella, tomatoes, and basil with balsamic glaze
                                  </p>
                                </div>
                                <div className="font-medium">$10</div>
                              </div>
                            </li>
                            <li>
                              <div className="flex justify-between">
                                <div>
                                  <h4 className="font-medium">Calamari Fritti</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Crispy fried calamari with marinara sauce
                                  </p>
                                </div>
                                <div className="font-medium">$12</div>
                              </div>
                            </li>
                          </ul>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-6">
                          <h3 className="text-xl font-semibold mb-4">Main Courses</h3>
                          <ul className="space-y-4">
                            <li className="border-b pb-4">
                              <div className="flex justify-between">
                                <div>
                                  <h4 className="font-medium">Spaghetti Carbonara</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Classic pasta with pancetta, egg, and parmesan
                                  </p>
                                </div>
                                <div className="font-medium">$16</div>
                              </div>
                            </li>
                            <li className="border-b pb-4">
                              <div className="flex justify-between">
                                <div>
                                  <h4 className="font-medium">Margherita Pizza</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Tomato sauce, mozzarella, and fresh basil
                                  </p>
                                </div>
                                <div className="font-medium">$14</div>
                              </div>
                            </li>
                            <li>
                              <div className="flex justify-between">
                                <div>
                                  <h4 className="font-medium">Chicken Parmesan</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Breaded chicken with tomato sauce and melted cheese
                                  </p>
                                </div>
                                <div className="font-medium">$18</div>
                              </div>
                            </li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="reviews" className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
                    <div className="space-y-4">
                      <div className="border-b pb-4">
                        <div className="flex items-center mb-2">
                          <div className="flex mr-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn("h-4 w-4", i < 5 ? "fill-yellow-400 text-yellow-400" : "text-gray-300")}
                              />
                            ))}
                          </div>
                          <span className="font-medium">John D.</span>
                          <span className="text-muted-foreground text-sm ml-2">2 weeks ago</span>
                        </div>
                        <p className="text-muted-foreground">
                          Amazing food and atmosphere! The pasta was perfectly cooked and the service was excellent.
                          Will definitely be coming back.
                        </p>
                      </div>
                      <div className="border-b pb-4">
                        <div className="flex items-center mb-2">
                          <div className="flex mr-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn("h-4 w-4", i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300")}
                              />
                            ))}
                          </div>
                          <span className="font-medium">Sarah M.</span>
                          <span className="text-muted-foreground text-sm ml-2">1 month ago</span>
                        </div>
                        <p className="text-muted-foreground">
                          Great Italian food in a cozy setting. The bruschetta was delicious and the pizza had the
                          perfect crust. Highly recommend!
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center mb-2">
                          <div className="flex mr-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn("h-4 w-4", i < 5 ? "fill-yellow-400 text-yellow-400" : "text-gray-300")}
                              />
                            ))}
                          </div>
                          <span className="font-medium">Michael T.</span>
                          <span className="text-muted-foreground text-sm ml-2">2 months ago</span>
                        </div>
                        <p className="text-muted-foreground">
                          The best Italian restaurant in town! Everything from the appetizers to the desserts was
                          outstanding. The staff was friendly and attentive.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div>
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Make a Reservation</h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : "Select a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(date) => date && setDate(date)}
                            disabled={(date) => date < new Date() || date > addDays(new Date(), 30)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Party Size</label>
                      <Select value={partySize} onValueChange={setPartySize}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select party size" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => (
                            <SelectItem key={size} value={size.toString()}>
                              {size} {size === 1 ? "person" : "people"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Available Time Slots</label>
                      <div className="grid grid-cols-2 gap-2">
                        {timeSlots.length > 0 ? (
                          timeSlots.map((slot) => (
                            <Button
                              key={slot.slot}
                              variant={selectedTimeSlot === slot.slot ? "default" : "outline"}
                              className="text-center"
                              disabled={Number.parseInt(partySize) > slot.availableSeats}
                              onClick={() => setSelectedTimeSlot(slot.slot)}
                            >
                              {slot.displayTime}
                            </Button>
                          ))
                        ) : (
                          <p className="col-span-2 text-center text-muted-foreground py-2">
                            No available time slots for this date
                          </p>
                        )}
                      </div>
                    </div>

                    <Dialog open={isReservationDialogOpen} onOpenChange={setIsReservationDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full" disabled={!selectedTimeSlot}>
                          Reserve Table
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm Reservation</DialogTitle>
                          <DialogDescription>
                            Please review your reservation details before confirming.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Restaurant:</span>
                            <span>{restaurant.name}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Date:</span>
                            <span>{format(date, "MMMM d, yyyy")}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Time Slot:</span>
                            <span>
                              {selectedTimeSlot !== null
                                ? timeSlots.find((slot) => slot.slot === selectedTimeSlot)?.displayTime
                                : "Not selected"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Price Per Seat:</span>
                            <span>${Number(restaurant.price_per_seat).toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Total Price:</span>
                            <span>${(restaurant.price_per_seat * Number.parseInt(partySize)).toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Party Size:</span>
                            <span>
                              {partySize} {Number.parseInt(partySize) === 1 ? "person" : "people"}
                            </span>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsReservationDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleReservation} disabled={isReservationLoading}>
                            {isReservationLoading ? "Confirming..." : "Confirm Reservation"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
