import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background font-sans">
      <div className="text-center max-w-md px-6">
        <p className="font-serif text-8xl font-bold text-primary/20 mb-4">404</p>
        <h1 className="font-serif text-2xl font-semibold text-foreground mb-2">Page Not Found</h1>
        <p className="text-sm text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-full px-8">
            <ArrowLeft className="w-4 h-4" /> Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}