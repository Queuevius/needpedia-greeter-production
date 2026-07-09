import { Inter } from "next/font/google";
import "./globals.css";
import EnvCheck from "./env-check";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Needpedia Chatbot",
  description: "AI-powered chat interface using OpenRouter",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <EnvCheck>{children}</EnvCheck>
      </body>
    </html>
  );
}
