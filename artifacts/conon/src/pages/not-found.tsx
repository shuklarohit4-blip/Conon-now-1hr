import { Link } from "wouter";
import { Construction } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-center p-6">
      <Construction className="w-24 h-24 text-primary mb-6 animate-pulse" />
      <h1 className="text-6xl font-display font-bold text-white mb-2">404</h1>
      <h2 className="text-2xl font-bold text-zinc-300 mb-4">Under Construction</h2>
      <p className="text-zinc-500 max-w-md mx-auto mb-8">
        The page you are looking for is currently being built or doesn't exist.
      </p>
      <Link href="/home" className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
        Back to Site
      </Link>
    </div>
  );
}
