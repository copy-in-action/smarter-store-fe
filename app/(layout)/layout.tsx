import { BottomNavigation } from "@/widgets/bottom-navigation";
import { Header } from "@/widgets/header";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="mb-14 sm:mb-0">{children}</main>
      <BottomNavigation />
    </>
  );
}
