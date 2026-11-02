import { redirect } from "next/navigation";

export default function PlanRedirectPage() {
  redirect("/guided-learning?tab=curricula");
}
