"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

import AuthForm from "@/components/AuthForm";
import LoadingState from "@/components/LoadingState";

import { supabase } from "@/lib/supabase";

export default function HomePage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const initialUser = sessionData.session?.user || null;

        if (initialUser) {
          router.push("/dashboard");
        } else {
          setLoading(false);
        }

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === "SIGNED_IN" && session?.user) {
            router.push("/dashboard");
          }
        });

        return () => subscription.unsubscribe();
      } catch (err: any) {
        console.error("Auth initialization error:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <AuthForm supabase={supabase} toast={toast} setLoading={setLoading} />
    </div>
  );
}
