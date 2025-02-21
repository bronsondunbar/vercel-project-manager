import { NextRequest, NextResponse } from "next/server";

interface Deployment {
  state: string;
  [key: string]: any;
}

interface DeploymentsResponse {
  deployments: Deployment[];
  [key: string]: any;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Extract token from the Authorization header
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Authorization header is missing or invalid" },
      { status: 401 }
    );
  }

  // Extract the token from the header value
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  if (!token) {
    return NextResponse.json({ error: "No token provided" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId");
  const projectId = searchParams.get("projectId");

  if (!teamId || !projectId) {
    return NextResponse.json(
      { error: "Missing query params" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://api.vercel.com/v6/deployments?teamId=${teamId}&projectId=${projectId}&state=BUILDING`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch deployment status");

    const data: DeploymentsResponse = await response.json();
    return NextResponse.json({ state: data?.deployments[0]?.state || "READY" });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
