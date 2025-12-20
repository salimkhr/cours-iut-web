export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <section className="mx-auto px-4 md:px-8">{children}</section>
    );
}
