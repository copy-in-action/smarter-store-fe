import { redirect } from "next/navigation";
import { PAGES } from "@/shared/constants";

export default function AdminPage() {
  redirect(PAGES.ADMIN.VENUES.CREATE.path);
}
