import { redirect } from "next/navigation";

export default function Home() {
  // redirect homepage → dashboard
  redirect("/dashboard");

  return null;
}