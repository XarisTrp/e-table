"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner"
import { type Restaurant, restaurantsApi } from "@/lib/api-service"

const cuisineTypes = [
  "Italian",
  "Japanese",
  "Chinese",
  "Mexican",
  "Indian",
  "French",
  "Thai",
  "American",
  "Mediterranean",
  "Korean",
  "Vietnamese",
  "Greek",
  "Spanish",
  "Lebanese",
  "Turkish",
  "Other",
]

export default function EditRestaurantPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    cuisine: "",
    description: "",
    address: "",
    city: "",
    totalSeats: "",
    price_per_seat: "",
    openingTime: "",
    closingTime: "",
    image: "",
  })

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setIsLoading(true)
        const data = await restaurantsApi.getById(params.id as string)
        setRestaurant(data)
        setFormData({
          name: data.name,
          cuisine: data.cuisine,
          description: data.description || "",
          address: data.address,
          city: data.city,
          totalSeats: data.totalSeats.toString(),
          price_per_seat: data.price_per_seat.toString(),
          openingTime: data.openingTime,
          closingTime: data.closingTime,
          image: data.image || "/placeholder.svg?height=300&width=400",
        })
      } catch (error) {
        console.error("Failed to fetch restaurant:", error)
        toast({
          title: "Error",
          description: "Failed to load restaurant details. Please try again.",
          variant: "destructive",
        })
        router.push("/dashboard/restaurants")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRestaurant()
  }, [params.id, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Convert numeric fields to numbers and set location based on city
      const restaurantData = {
        ...formData,
        totalSeats: Number.parseInt(formData.totalSeats, 10),
        price_per_seat: Number.parseFloat(formData.price_per_seat),
        location: formData.city, // Set location to city if not explicitly provided
      }

      await restaurantsApi.update(params.id as string, restaurantData)

      toast({
        title: "Restaurant updated",
        description: "Your restaurant has been successfully updated.",
      })
      router.push(`/dashboard/restaurants/${params.id}`)
    } catch (error) {
      console.error("Failed to update restaurant:", error)
      toast({
        title: "Error",
        description: "Failed to update your restaurant. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

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

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Edit Restaurant</h1>
        <p className="text-muted-foreground">Update your restaurant information.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Restaurant Information</CardTitle>
            <CardDescription>
              Provide basic information about your restaurant to help customers find you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter restaurant name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cuisine">Cuisine Type</Label>
                <Select
                  value={formData.cuisine}
                  onValueChange={(value) => handleSelectChange("cuisine", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cuisine type" />
                  </SelectTrigger>
                  <SelectContent>
                    {cuisineTypes.map((cuisine) => (
                      <SelectItem key={cuisine} value={cuisine}>
                        {cuisine}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your restaurant, specialties, and atmosphere"
                value={formData.description}
                onChange={handleChange}
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Street address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="totalSeats">Total Seats</Label>
                <Input
                  id="totalSeats"
                  name="totalSeats"
                  type="number"
                  min="1"
                  value={formData.totalSeats}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_per_seat">Price Per Seat ($)</Label>
                <Input
                  id="price_per_seat"
                  name="price_per_seat"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.price_per_seat}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="openingTime">Opening Time</Label>
                <Input
                  id="openingTime"
                  name="openingTime"
                  type="time"
                  value={formData.openingTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="closingTime">Closing Time</Label>
              <Input
                id="closingTime"
                name="closingTime"
                type="time"
                value={formData.closingTime}
                onChange={handleChange}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-4">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
