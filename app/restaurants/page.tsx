"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RestaurantCard } from "@/components/restaurant-card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { Search, SlidersHorizontal } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { type Restaurant, restaurantsApi } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"

const cuisineTypes = [
  "All",
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
]

export default function RestaurantsPage() {
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get("search") || ""
  const { toast } = useToast()

  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [cuisine, setCuisine] = useState("All")
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState("rating")

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setIsLoading(true)
        const data = await restaurantsApi.getAll(searchQuery, cuisine)
        setRestaurants(data)
      } catch (error) {
        console.error("Failed to fetch restaurants:", error)
        toast({
          title: "Error",
          description: "Failed to load restaurants. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchRestaurants()
  }, [searchQuery, cuisine, toast])

  // Apply sorting and filtering in a separate effect that doesn't update filteredRestaurants if it would cause a loop
  useEffect(() => {
    // Create a sorted copy of the restaurants array
    const sorted = [...restaurants]

    if (sortBy === "rating") {
      sorted.sort((a, b) => b.rating - a.rating)
    } else if (sortBy === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === "seats") {
      sorted.sort((a, b) => b.totalSeats - a.totalSeats)
    }

    setFilteredRestaurants(sorted)
  }, [restaurants, sortBy])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // The filtering is handled by the useEffect
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <MainNav />
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Find Your Perfect Dining Experience
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Browse restaurants and reserve your table in just a few clicks.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search restaurants or cuisines..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="icon">
                        <SlidersHorizontal className="h-4 w-4" />
                        <span className="sr-only">Filter</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Filter Restaurants</SheetTitle>
                        <SheetDescription>Narrow down your search with these filters.</SheetDescription>
                      </SheetHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="cuisine-filter">Cuisine</Label>
                          <Select value={cuisine} onValueChange={setCuisine}>
                            <SelectTrigger id="cuisine-filter">
                              <SelectValue placeholder="Select cuisine" />
                            </SelectTrigger>
                            <SelectContent>
                              {cuisineTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button onClick={() => setCuisine("All")}>Reset Filters</Button>
                      </div>
                    </SheetContent>
                  </Sheet>
                </form>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight">
                {filteredRestaurants.length} {filteredRestaurants.length === 1 ? "Restaurant" : "Restaurants"} Found
              </h2>
              <div className="flex items-center space-x-2">
                <Label htmlFor="sort-by" className="hidden md:inline-block">
                  Sort by:
                </Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger id="sort-by" className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="seats">Most Seats</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center p-12">
                <LoadingSpinner />
              </div>
            ) : filteredRestaurants.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredRestaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <h3 className="text-xl font-semibold mb-2">No restaurants found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("")
                    setCuisine("All")
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
