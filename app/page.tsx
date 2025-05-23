import Link from "next/link"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { HomeSearch } from "@/components/home-search"
import { restaurantsApi, type Restaurant } from "@/lib/api-service"

async function getFeaturedRestaurants(): Promise<Restaurant[]> {
  try {
    return await restaurantsApi.getFeatured()
  } catch (error) {
    console.error("Failed to fetch featured restaurants:", error)
    return []
  }
}

export default async function Home() {
  const featuredRestaurants = await getFeaturedRestaurants()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <MainNav />
          <div className="ml-auto flex items-center space-x-4">
            <Link href="/auth/login" className="text-sm font-medium hover:underline">
              Log in
            </Link>
            <Link
              href="/auth/register"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-teal-50 to-white dark:from-gray-900 dark:to-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Find and Reserve Tables at Your Favorite Restaurants
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Discover new dining experiences and secure your spot with just a few clicks.
                </p>
              </div>
              <HomeSearch />
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Featured Restaurants</h2>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Explore some of our most popular dining destinations.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-8">
              {featuredRestaurants.length > 0 ? (
                featuredRestaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={restaurant.image || "/placeholder.svg?height=300&width=400"}
                        alt={restaurant.name}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold">{restaurant.name}</h3>
                          <p className="text-sm text-gray-500">{restaurant.location}</p>
                        </div>
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-teal-50 text-teal-700 dark:bg-teal-900 dark:text-teal-300">
                          {restaurant.cuisine}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 mt-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <span className="text-sm font-medium">{restaurant.rating}</span>
                        <span className="text-sm text-gray-500">• {restaurant.totalSeats} seats</span>
                      </div>
                      <div className="mt-4">
                        <Link href={`/restaurants/${restaurant.id}`} className="w-full">
                          <button className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full rounded-md text-sm font-medium">
                            View Details
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-10">
                  <p className="text-muted-foreground">No featured restaurants available at the moment.</p>
                </div>
              )}
            </div>
            <div className="flex justify-center mt-10">
              <Link href="/restaurants">
                <button className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md text-sm font-medium">
                  View All Restaurants
                </button>
              </Link>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-teal-100 px-3 py-1 text-sm dark:bg-teal-800">
                  For Restaurant Owners
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  List Your Restaurant on E-Table
                </h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Reach more customers, manage reservations efficiently, and grow your business with our platform.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/auth/register?role=OWNER">
                    <button className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md text-sm font-medium">
                      Get Started
                    </button>
                  </Link>
                  <Link href="/about">
                    <button className="border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 rounded-md text-sm font-medium">
                      Learn More
                    </button>
                  </Link>
                </div>
              </div>
              <div className="flex justify-center">
                <img
                  src="/placeholder.svg?height=400&width=600"
                  width={600}
                  height={400}
                  alt="Restaurant management dashboard"
                  className="rounded-lg object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
