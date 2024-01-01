import { lucia } from "lucia";

import { elysia } from "lucia/middleware";
import { discord } from "@lucia-auth/oauth/providers";
import { prisma } from "@lucia-auth/adapter-prisma";
import { prisma as client } from "../../database";

const auth = lucia({
	env: "DEV",
	middleware: elysia(),
	adapter: prisma(client),
});

const discordAuth = discord(auth, {
	clientId: "1128557695356653729",
	clientSecret: "x9dzZlMAW0PBK4HyZY-hhSj7iur5m6z0",
	redirectUri: "http://localhost:3000/auth/discord/callback",
});

export { auth, discordAuth };
export type Auth = typeof auth;
export type DiscordAuth = typeof discordAuth;
