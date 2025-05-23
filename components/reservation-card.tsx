"use client"

import { useState } from "react"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, Users } from "lucide-react"
import { getTimeSlotDisplay } from "@/lib/utils"
import { type Reservation, reservationsApi } from "@/lib/api-service"

interface ReservationCardProps {
  reservation: Reservation
  isPast?: boolean
  isCancelled?: boolean
}

export function ReservationCard({ reservation, isPast, isCancelled }: ReservationCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleCancelReservation = async () => {
    setIsLoading(true)
    try {
      await reservationsApi.cancel(reservation.id)
      toast({
        title: "Reservation cancelled",
        description: "Your reservation has been successfully cancelled.",
      })
      // Refresh the page to update the list
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel your reservation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formattedDate = format(parseISO(reservation.date), "MMMM d, yyyy")

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{reservation.restaurantName}</CardTitle>
          {reservation.status === "ACTIVE" && (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">Active</Badge>
          )}
          {reservation.status === "CANCELLED" && (
            <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
              Cancelled
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{getTimeSlotDisplay(reservation.time_slot)}</span>
          </div>
          <div className="flex items-center">
            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>
              {reservation.partySize} {reservation.partySize === 1 ? "person" : "people"}
            </span>
          </div>
          <div className="flex items-center">
            <span className="mr-2 text-muted-foreground">Total:</span>
            <span>${Number(reservation.total_price).toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link href={`/restaurants/${reservation.restaurantId}`}>
          <Button variant="outline" size="sm">
            View Restaurant
          </Button>
        </Link>

        {!isPast && !isCancelled && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isLoading}>
                {isLoading ? "Cancelling..." : "Cancel"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Reservation</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel your reservation at {reservation.restaurantName} on {formattedDate} at{" "}
                  {getTimeSlotDisplay(reservation.time_slot)}?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>No, keep it</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancelReservation}>Yes, cancel reservation</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardFooter>
    </Card>
  )
}
