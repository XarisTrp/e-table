"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReservationCard } from "@/components/reservation-card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { CalendarDays } from "lucide-react"
import { Card, CardContent, CardDescription } from "@/components/ui/card"
import { type Reservation, reservationsApi } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"

export default function ReservationsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setIsLoading(true)
        const data = await reservationsApi.getCustomerReservations()
        setReservations(data)
      } catch (error) {
        console.error("Failed to fetch reservations:", error)
        toast({
          title: "Error",
          description: "Failed to load your reservations. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchReservations()
  }, [toast])

  const upcomingReservations = reservations.filter(
    (res) => res.status === "ACTIVE" && new Date(`${res.date}T00:00:00`) > new Date(),
  )

  const pastReservations = reservations.filter(
    (res) => res.status === "ACTIVE" && new Date(`${res.date}T00:00:00`) <= new Date(),
  )

  const cancelledReservations = reservations.filter((res) => res.status === "CANCELLED")

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Reservations</h1>
        <p className="text-muted-foreground">View and manage your restaurant reservations.</p>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <LoadingSpinner />
            </div>
          ) : upcomingReservations.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingReservations
              .filter((reservation) => reservation.status === 'ACTIVE')
                .map((reservation) => (
                  <ReservationCard key={reservation.id} reservation={reservation} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <CalendarDays className="h-10 w-10 text-muted-foreground mb-4" />
                <CardDescription>You don&apos;t have any upcoming reservations.</CardDescription>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="past" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <LoadingSpinner />
            </div>
          ) : pastReservations.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastReservations.map((reservation) => (
                <ReservationCard key={reservation.id} reservation={reservation} isPast />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <CalendarDays className="h-10 w-10 text-muted-foreground mb-4" />
                <CardDescription>You don&apos;t have any past reservations.</CardDescription>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="cancelled" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <LoadingSpinner />
            </div>
          ) : cancelledReservations.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cancelledReservations.map((reservation) => (
                <ReservationCard key={reservation.id} reservation={reservation} isCancelled />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <CalendarDays className="h-10 w-10 text-muted-foreground mb-4" />
                <CardDescription>You don&apos;t have any cancelled reservations.</CardDescription>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
