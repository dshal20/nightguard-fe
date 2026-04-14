export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function VenueIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
