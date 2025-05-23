"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { restaurantsApi } from "@/lib/api-service"

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

export default function AddRestaurantPage() {
  const [formData, setFormData] = useState({
    name: "",
    cuisine: "",
    description: "",
    address: "",
    city: "",
    totalSeats: "20",
    price_per_seat: "25.00",
    openingTime: "09:00",
    closingTime: "22:00",
    image: "/placeholder.svg?height=300&width=400", // Default placeholder
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Convert numeric fields to numbers and set location based on city
      const restaurantData = {
        ...formData,
        totalSeats: Number.parseInt(formData.totalSeats, 10),
        price_per_seat: Number.parseFloat(formData.price_per_seat),
        location: formData.city, // Set location to city if not explicitly provided
      }

      await restaurantsApi.create(restaurantData)

      toast({
        title: "Restaurant added",
        description: "Your restaurant has been successfully added.",
      })
      router.push("/dashboard/restaurants")
    } catch (error) {
      console.error("Failed to add restaurant:", error)
      toast({
        title: "Error",
        description: "Failed to add your restaurant. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Add New Restaurant</h1>
        <p className="text-muted-foreground">Fill in the details to list your restaurant on E-Table.</p>
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
          </CardContent>
          <CardFooter className="flex justify-end space-x-4">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Restaurant"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
