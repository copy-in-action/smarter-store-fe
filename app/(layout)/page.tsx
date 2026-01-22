export const dynamic = "force-dynamic";

import { PAGES } from "@/shared/config";
import { HomePage } from "@/views/service/home";

export const metadata = PAGES.HOME.metadata;

export default function Home() {
  return <HomePage />;
}
