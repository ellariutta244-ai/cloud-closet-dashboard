import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
   "https://gfdurfdqrhjzxjperknw.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmZHVyZmRxcmhqenhqcGVya253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNjI3MDIsImV4cCI6MjA4ODkzODcwMn0.ciR7C4VK4vKvgqPHriiw7DmednNBBq7x_2zI1l-oAAY"
  )
}