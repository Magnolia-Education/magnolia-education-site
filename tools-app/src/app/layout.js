export const metadata = {
  title: 'Magnolia Education Tools',
  description: 'Interactive learning tools by Magnolia Education',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
