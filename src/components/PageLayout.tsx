type PageLayoutProps = {
  children: React.ReactNode;
};

export default function PageLayout({ children }: PageLayoutProps) {
  return <main className="min-h-screen pt-32 pb-24">{children}</main>;
}
