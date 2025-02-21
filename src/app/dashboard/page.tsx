"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

import Header from "@/components/Header";
import TokenForm from "@/components/TokenForm";
import ProjectsList from "@/components/ProjectsList";
import ProjectsSkeletonLoading from "@/components/ProjectsSkeletonLoading";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { UserToken, VercelData } from "@/lib/types";

export default function DashboardPage() {
  const [data, setData] = useState<VercelData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [dataLoading, setDataLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [tokens, setTokens] = useState<UserToken[]>([]);
  const [activeToken, setActiveToken] = useState<UserToken | null>(null);
  const [displayMode, setDisplayMode] = useState<
    "loading" | "token-form" | "projects"
  >("loading");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { toast } = useToast();
  const router = useRouter();

  const fetchingRef = useRef<boolean>(false);

  async function fetchVercelData(token: string): Promise<void> {
    try {
      setDataLoading(true);
      const response = await fetch("/api/vercel/resources", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      setData(result);
      setDisplayMode("projects");
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setDataLoading(false);
      setLoading(false);
      fetchingRef.current = false;
    }
  }

  async function fetchUserTokens(userId: string): Promise<void> {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      console.log("Fetching tokens for user:", userId);
      const { data: tokensData, error } = await supabase
        .from("user_vercel_tokens")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        throw new Error(error.message);
      }

      if (tokensData && tokensData.length > 0) {
        console.log("Found tokens:", tokensData.length);
        const formattedTokens = tokensData.map((t) => ({
          id: t.id,
          token: t.token_value,
          name: t.token_name,
          created_at: t.created_at,
        }));

        setTokens(formattedTokens);

        const firstToken = formattedTokens[0];
        setActiveToken(firstToken);
        await fetchVercelData(firstToken.token);
      } else {
        console.log("No tokens found, showing token form");
        setDisplayMode("token-form");
        setLoading(false);
        fetchingRef.current = false;
      }
    } catch (err: any) {
      console.error("Error fetching tokens:", err);
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      setLoading(false);
      fetchingRef.current = false;
    }
  }

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const initialUser = sessionData.session?.user || null;

        if (!initialUser) {
          router.push("/");
          return;
        }

        setUser(initialUser);
        await fetchUserTokens(initialUser.id);

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === "SIGNED_OUT") {
            router.push("/");
          }
        });

        return () => subscription.unsubscribe();
      } catch (err: any) {
        console.error("Session check error:", err);
        router.push("/");
      }
    };

    checkSession();
  }, [router]);

  async function handleSignOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  }

  async function handleTokenSave(
    tokenValue: string,
    tokenName: string
  ): Promise<void> {
    try {
      setLoading(true);

      const { data: newToken, error } = await supabase
        .from("user_vercel_tokens")
        .insert({
          user_id: user.id,
          token_value: tokenValue,
          token_name: tokenName,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Token saved successfully",
      });

      const formattedToken = {
        id: newToken.id,
        token: newToken.token_value,
        name: newToken.token_name,
        created_at: newToken.created_at,
      };

      setTokens((prev) => [...prev, formattedToken]);
      setActiveToken(formattedToken);
      await fetchVercelData(tokenValue);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to save token",
        variant: "destructive",
      });
      setLoading(false);
    }
  }

  async function handleTokenDelete(tokenId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("user_vercel_tokens")
        .delete()
        .eq("id", tokenId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Token deleted successfully",
      });

      const updatedTokens = tokens.filter((t) => t.id !== tokenId);
      setTokens(updatedTokens);

      if (activeToken && activeToken.id === tokenId) {
        if (updatedTokens.length > 0) {
          const newActiveToken = updatedTokens[0];
          setActiveToken(newActiveToken);
          await fetchVercelData(newActiveToken.token);
        } else {
          setActiveToken(null);
          setData(null);
          setDisplayMode("token-form");
        }
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to delete token",
        variant: "destructive",
      });
    }
  }

  function handleTokenSwitch(tokenId: string): void {
    const selectedToken = tokens.find((t) => t.id === tokenId);
    if (selectedToken) {
      setDataLoading(true);
      setActiveToken(selectedToken);
      fetchVercelData(selectedToken.token);
    }
  }

  function handleAddNewToken(): void {
    setDisplayMode("token-form");
  }

  function handleCancelAddToken(): void {
    if (tokens.length > 0) {
      if (!activeToken) {
        setActiveToken(tokens[0]);
        fetchVercelData(tokens[0].token);
      } else {
        setDisplayMode("projects");
      }
    }
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setSearchTerm(e.target.value);
  }

  return (
    <div className="space-y-6">
      <Header
        title="Vercel Project Dashboard"
        tokens={tokens}
        activeToken={activeToken}
        onTokenSwitch={handleTokenSwitch}
        onTokenDelete={handleTokenDelete}
        onAddNewToken={handleAddNewToken}
        onSignOut={handleSignOut}
      />

      {displayMode === "token-form" && (
        <div className="flex items-center justify-center">
          <TokenForm
            onSubmit={handleTokenSave}
            onCancel={tokens.length > 0 ? handleCancelAddToken : undefined}
          />
        </div>
      )}

      {loading && <ProjectsSkeletonLoading />}

      {displayMode === "projects" && (
        <>
          <div className="px-8 relative flex justify-between items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 w-full"
                disabled={dataLoading}
              />
            </div>
          </div>

          {data && (
            <ProjectsList
              activeToken={activeToken}
              data={data}
              searchTerm={searchTerm}
            />
          )}
        </>
      )}
    </div>
  );
}
