import { redirect } from "next/navigation";

export default function BrowserRedirectPage() {
  redirect("/search-topics");
}
