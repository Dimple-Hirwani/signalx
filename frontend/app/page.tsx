import { redirect } from "next/navigation";

// Root route redirects to login; AuthGuard (Task 14) will handle
// redirecting authenticated users to their conversations.
export default function RootPage() {
  redirect("/login");
}
