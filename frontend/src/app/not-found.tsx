import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <ShoppingBag className="w-12 h-12 text-gray-400" />
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Oops! Page not found.</h1>
      <p className="text-gray-500 max-w-md mb-8">
        We can't seem to find the page you're looking for. It might have been removed, renamed, or didn't exist in the first place.
      </p>
      <div className="flex gap-4">
        <Link href="/">
          <Button className="bg-black text-white hover:bg-black/90 px-8">
            Return Home
          </Button>
        </Link>
        <Link href="/products">
          <Button variant="outline" className="px-8">
            Browse Products
          </Button>
        </Link>
      </div>
    </div>
  );
}

