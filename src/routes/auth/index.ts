import { Elysia } from "elysia";

import { auth } from "../../libs/lucia";
import { discordAuthRoutes } from "./discord";

const router = new Elysia().group("/discord", (group) =>
	group.use(discordAuthRoutes),
);

router.get("/profile", async (ctx) => {
	const req = auth.handleRequest(ctx);
	const session = await req.validate();

	if (!session) {
		ctx.set.redirect = "/auth/discord";
	}

	return session;
});

router.get("/logout", async (ctx) => {
	const req = auth.handleRequest(ctx);
	const session = await req.validate();

	if (!session) {
		return new Response("Unauthorized", {
			status: 401,
		});
	}

	await auth.invalidateSession(session.sessionId);

	const sessionCookie = auth.createSessionCookie(null);
	return new Response(null, {
		headers: {
			Location: "/",
			"Set-Cookie": sessionCookie.serialize(),
		},
		status: 302,
	});
});

export { router as authRoutes };
