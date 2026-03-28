import { redirect } from "next/navigation";

// The root "/" route is handled by (dashboard)/page.tsx
// This file is a catch-all that shouldn't be reached in normal flow
export default function RootPage() {
  redirect("/login");
}
