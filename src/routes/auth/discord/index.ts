import { Elysia } from "elysia";
import { parseCookie, serializeCookie } from "lucia/utils";

import { auth, discordAuth } from "../../../libs/lucia";
import { OAuthRequestError } from "@lucia-auth/oauth";

const router = new Elysia();

router.get("/", async () => {
	const [url, state] = await discordAuth.getAuthorizationUrl();

	const stateCookie = serializeCookie("discord_oauth_state", state, {
		httpOnly: true,
		secure: false,
		path: "/",
		maxAge: 60 * 60 * 24 * 7,
	});

	return new Response(null, {
		status: 302,
		headers: {
			Location: url.toString(),
			"Set-Cookie": stateCookie,
		},
	});
});

router.get("/callback", async ({ headers, request }) => {
	const cookies = parseCookie((headers.cookie ?? "") as string);
	const storedState = cookies?.discord_oauth_state;
	const url = new URL(request.url);
	const state = url.searchParams.get("state");
	const code = url.searchParams.get("code");

	if (!storedState || !state || storedState !== state || !code) {
		return new Response("STORED SESSION NOT FOUND", {
			status: 400,
		});
	}

	try {
		const { getExistingUser, discordUser, createUser } =
			await discordAuth.validateCallback(code);

		const getUser = async () => {
			const existingUser = await getExistingUser();

			if (existingUser) return existingUser;

			const user = await createUser({
				attributes: {
					username: discordUser.username,
					avatar: discordUser.avatar,
				},
			});

			return user;
		};

		const user = await getUser();
		const session = await auth.createSession({
			userId: user.userId,
			attributes: {},
		});

		const sessionCookie = auth.createSessionCookie(session);

		return new Response("Successful logged in", {
			headers: {
				Location: "/",
				"Set-Cookie": sessionCookie.serialize(),
			},
			status: 302,
		});
	} catch (e) {
		if (e instanceof OAuthRequestError) {
			return new Response(null, {
				status: 400,
			});
		}

		return new Response(null, {
			status: 500,
		});
	}
});

export { router as discordAuthRoutes };
