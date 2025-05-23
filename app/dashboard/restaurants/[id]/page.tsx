"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, Edit, MapPin, Users } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { type Restaurant, type Reservation, restaurantsApi, reservationsApi } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"
import { getTimeSlotDisplay } from "@/lib/utils"

export default function RestaurantManagementPage() {
  const params = useParams()
  const { toast } = useToast()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setIsLoading(true)
        const restaurantData = await restaurantsApi.getById(params.id as string)
        setRestaurant(restaurantData)

        const reservationsData = await reservationsApi.getRestaurantReservations(params.id as string)
        setReservations(reservationsData)
      } catch (error) {
        console.error("Failed to fetch restaurant data:", error)
        toast({
          title: "Error",
          description: "Failed to load restaurant data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchRestaurantData()
  }, [params.id, toast])

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (!restaurant) {
    return <div>Restaurant not found</div>
  }

  const todayReservations = reservations.filter(
    (res) => res.date === format(new Date(), "yyyy-MM-dd") && res.status !== "CANCELLED",
  )

  const upcomingReservations = reservations.filter(
    (res) =>
      res.status !== "CANCELLED" &&
      new Date(`${res.date}T00:00:00`) > new Date() &&
      res.date !== format(new Date(), "yyyy-MM-dd"),
  )

  const pastReservations = reservations.filter(
    (res) =>
      res.status !== "CANCELLED" &&
      new Date(`${res.date}T00:00:00`) < new Date() &&
      res.date !== format(new Date(), "yyyy-MM-dd"),
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{restaurant.name}</h1>
          <p className="text-muted-foreground">Manage your restaurant details and reservations.</p>
        </div>
        <Link href={`/dashboard/restaurants/${restaurant.id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Restaurant
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Reservations</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayReservations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Seats</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{restaurant.totalSeats}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opening Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {format(new Date(`2000-01-01T${restaurant.openingTime}`), "h:mm a")} -
              {format(new Date(`2000-01-01T${restaurant.closingTime}`), "h:mm a")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Location</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{restaurant.location}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Reservations</CardTitle>
            </CardHeader>
            <CardContent>
              {todayReservations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Time Slot</TableHead>
                      <TableHead>Party Size</TableHead>
                      <TableHead>Total Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Contact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {todayReservations.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell className="font-medium">{reservation.customerName}</TableCell>
                        <TableCell>{getTimeSlotDisplay(reservation.time_slot)}</TableCell>
                        <TableCell>{reservation.partySize}</TableCell>
                        <TableCell>${reservation.total_price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              reservation.status === "ACTIVE"
                                ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                            }
                          >
                            {reservation.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{reservation.contactInfo}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex justify-center py-6 text-muted-foreground">No reservations for today</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Reservations</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingReservations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Party Size</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Contact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingReservations.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell className="font-medium">{reservation.customerName}</TableCell>
                        <TableCell>{format(new Date(reservation.date), "MMM d, yyyy")}</TableCell>
                        <TableCell>{getTimeSlotDisplay(reservation.time_slot)}</TableCell>
                        <TableCell>{reservation.partySize}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              reservation.status === "ACTIVE"
                                ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                            }
                          >
                            {reservation.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{reservation.contactInfo}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex justify-center py-6 text-muted-foreground">No upcoming reservations</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="past" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Past Reservations</CardTitle>
            </CardHeader>
            <CardContent>
              {pastReservations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Party Size</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Contact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pastReservations.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell className="font-medium">{reservation.customerName}</TableCell>
                        <TableCell>{format(new Date(reservation.date), "MMM d, yyyy")}</TableCell>
                        <TableCell>{getTimeSlotDisplay(reservation.time_slot)}</TableCell>
                        <TableCell>{reservation.partySize}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              reservation.status === "ACTIVE"
                                ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                            }
                          >
                            {reservation.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{reservation.contactInfo}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex justify-center py-6 text-muted-foreground">No past reservations</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
