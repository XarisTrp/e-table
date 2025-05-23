// API service for handling all backend communication

// Types for API responses
export interface Restaurant {
  id: string
  name: string
  cuisine: string
  description: string
  image: string
  rating: number
  totalSeats: number
  location: string
  address: string
  city: string
  openingTime: string
  closingTime: string
  price_per_seat: number
  reservationCount?: number
}

export interface Reservation {
  id: string
  restaurantId: string
  restaurantName: string
  date: string
  time_slot: number
  partySize: number
  total_price: number
  status: "ACTIVE" | "CANCELLED"
  contactInfo?: string
  customerName?: string
}

export interface TimeSlot {
  slot: number
  availableSeats: number
  displayTime: string
}

export interface User {
  id: string
  name: string
  email: string
  role: "CUSTOMER" | "OWNER"
}

// API endpoints
const API_BASE_URL =
  typeof window === "undefined"
    ? (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000") + "/api"
    : "/api";

// Error handling helper
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || "An error occurred while fetching data")
  }
  return response.json()
}

// Authentication API
export const authApi = {
  login: async (email: string, password: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    return handleResponse<User>(response)
  },

  register: async (name: string, email: string, password: string, role: "CUSTOMER" | "OWNER"): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    })
    return handleResponse<User>(response)
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/me`)
    return handleResponse<User>(response)
  },

  logout: async (): Promise<void> => {
    await fetch(`${API_BASE_URL}/auth/logout`, { method: "POST" })
  },
}

// Restaurants API
export const restaurantsApi = {
  getAll: async (search?: string, cuisine?: string): Promise<Restaurant[]> => {
    let url = `${API_BASE_URL}/restaurants`
    const params = new URLSearchParams()

    if (search) params.append("search", search)
    if (cuisine && cuisine !== "All") params.append("cuisine", cuisine)

    if (params.toString()) url += `?${params.toString()}`

    const response = await fetch(url)
    return handleResponse<Restaurant[]>(response)
  },

  getById: async (id: string): Promise<Restaurant> => {
    const response = await fetch(`${API_BASE_URL}/restaurants/${id}`)
    return handleResponse<Restaurant>(response)
  },

  getOwnerRestaurants: async (): Promise<Restaurant[]> => {
    const response = await fetch(`${API_BASE_URL}/restaurants/my`)
    return handleResponse<Restaurant[]>(response)
  },

  create: async (restaurantData: Omit<Restaurant, "id" | "rating">): Promise<Restaurant> => {
    const response = await fetch(`${API_BASE_URL}/restaurants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(restaurantData),
    })
    return handleResponse<Restaurant>(response)
  },

  update: async (id: string, restaurantData: Partial<Restaurant>): Promise<Restaurant> => {
    const response = await fetch(`${API_BASE_URL}/restaurants/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(restaurantData),
    })
    return handleResponse<Restaurant>(response)
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/restaurants/${id}`, {
      method: "DELETE",
    })
    return handleResponse<void>(response)
  },

  getAvailability: async (id: string, date: string): Promise<TimeSlot[]> => {
    const response = await fetch(`${API_BASE_URL}/restaurants/${id}/availability?date=${date}`)
    return handleResponse<TimeSlot[]>(response)
  },

  getFeatured: async (): Promise<Restaurant[]> => {
    const response = await fetch(`${API_BASE_URL}/restaurants/featured`)
    return handleResponse<Restaurant[]>(response)
  },
}

// Reservations API
export const reservationsApi = {
  getCustomerReservations: async (): Promise<Reservation[]> => {
    const response = await fetch(`${API_BASE_URL}/reservations/my`)
    return handleResponse<Reservation[]>(response)
  },

  getRestaurantReservations: async (restaurantId: string): Promise<Reservation[]> => {
    const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}/reservations`)
    return handleResponse<Reservation[]>(response)
  },

  create: async (reservationData: {
    restaurantId: string
    date: string
    time_slot: number
    partySize: number
  }): Promise<Reservation> => {
    const response = await fetch(`${API_BASE_URL}/reservations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reservationData),
    })
    return handleResponse<Reservation>(response)
  },

  cancel: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
      method: "DELETE",
    })
    return handleResponse<void>(response)
  },
}
