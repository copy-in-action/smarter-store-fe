// app/sitemap.ts
export default function sitemap() {
  const SERVICE_DOMAIN =
    process.env.NODE_ENV === "development"
      ? "https://next.devhong.cc"
      : "https://ticket.devhong.cc";
  return [
    { url: `${SERVICE_DOMAIN}/pages/sitemap.xml` },
    // { url: `${SERVICE_DOMAIN}/performance/sitemap.xml` },
  ];
}
