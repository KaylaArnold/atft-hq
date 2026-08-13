import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (!email) {
      return NextResponse.json(
        {
          eligible: false,
          error: "Email is required.",
        },
        { status: 400 }
      );
    }

    const entitlement = await prisma.registrationEntitlement.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
        status: "ACTIVE",
      },
    });

    return NextResponse.json({
      eligible: Boolean(entitlement),
    });
  } catch (error) {
    console.error("Registration eligibility check failed:", error);

    return NextResponse.json(
      {
        eligible: false,
        error: "Unable to check registration eligibility.",
      },
      { status: 500 }
    );
  }
}