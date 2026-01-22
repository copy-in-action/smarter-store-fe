import { redirect } from "next/navigation";
import { PAGES } from "@/shared/config";

export default function AdminPage() {
  redirect(PAGES.ADMIN.VENUES.CREATE.path);
}
