"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EyeIcon, EyeOffIcon } from "lucide-react";

interface TokenFormProps {
  onSubmit: (token: string, name: string) => Promise<void>;
  onSignOut?: () => Promise<void>;
  onCancel?: () => void;
}

export default function TokenForm({
  onSubmit,
  onSignOut,
  onCancel,
}: TokenFormProps) {
  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(token, name);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Add Vercel API Token</CardTitle>
        <CardDescription>
          Add a new Vercel API token to access and manage your projects
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token-name">Token Name</Label>
            <Input
              id="token-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Personal Account, Work Projects"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="token-value">Vercel API Token</Label>
            <div className="relative">
              <Input
                id="token-value"
                type={showToken ? "text" : "password"}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter your Vercel API token"
                required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <div>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
          <div className="flex space-x-2">
            {onSignOut && (
              <Button type="button" variant="outline" onClick={onSignOut}>
                Sign Out
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Token"}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
