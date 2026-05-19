import { Geist, Geist_Mono } from "next/font/google";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "Leboncoincoin",
    description: "Plateforme pedagogique de petites annonces",
};

export default function RootLayout({ children }) {
    return (
        <html
            lang="fr"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
            <body className="min-h-full bg-zinc-50 text-zinc-950">
                <div className="flex min-h-screen flex-col">
                    <Navbar />
                    <div className="flex-1">{children}</div>
                    <Footer />
                </div>
            </body>
        </html>
    );
}
