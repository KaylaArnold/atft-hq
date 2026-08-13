import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { RoleName } from "@/generated/prisma/client";

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret is not configured." },
      { status: 500 }
    );
  }

  const headerPayload = await headers();

  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing webhook headers." },
      { status: 400 }
    );
  }

  const payload = await req.text();

  const webhook = new Webhook(webhookSecret);

  let event: any;

  try {
    event = webhook.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (error) {
    console.error("Webhook verification failed:", error);

    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 400 }
    );
  }

  if (event.type !== "user.created") {
    return NextResponse.json({ received: true });
  }

  const clerkUser = event.data;

  const primaryEmail =
    clerkUser.email_addresses?.find(
      (email: any) => email.id === clerkUser.primary_email_address_id
    )?.email_address ??
    clerkUser.email_addresses?.[0]?.email_address;

  if (!primaryEmail) {
    console.error("Clerk user was created without an email address.");

    return NextResponse.json(
      { error: "No email address found." },
      { status: 400 }
    );
  }

  const email = primaryEmail.trim().toLowerCase();

  const entitlement = await prisma.registrationEntitlement.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
      status: "ACTIVE",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!entitlement) {
    console.log(
      `Clerk user ${clerkUser.id} was created, but no active ATFT entitlement exists for ${email}.`
    );

    return NextResponse.json({
      received: true,
      provisioned: false,
    });
  }

  const memberRole = await prisma.role.findUnique({
    where: {
      name: RoleName.MEMBER,
    },
  });

  if (!memberRole) {
    console.error("MEMBER role does not exist.");

    return NextResponse.json(
      { error: "MEMBER role is not configured." },
      { status: 500 }
    );
  }

  const user = await prisma.user.upsert({
    where: {
      clerkUserId: clerkUser.id,
    },
    update: {
      email,
      firstName: clerkUser.first_name ?? null,
      lastName: clerkUser.last_name ?? null,
      avatarUrl: clerkUser.image_url ?? null,
    },
    create: {
      clerkUserId: clerkUser.id,
      email,
      firstName: clerkUser.first_name ?? null,
      lastName: clerkUser.last_name ?? null,
      avatarUrl: clerkUser.image_url ?? null,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: memberRole.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      roleId: memberRole.id,
    },
  });

  await prisma.registrationEntitlement.update({
    where: {
      id: entitlement.id,
    },
    data: {
      status: "USED",
      registeredAt: new Date(),
    },
  });

  console.log(`ATFT member provisioned successfully: ${email}`);

  return NextResponse.json({
    received: true,
    provisioned: true,
  });
}