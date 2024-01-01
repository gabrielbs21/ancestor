import { Elysia } from "elysia";
import { helmet } from "elysia-helmet";
import { logger } from "@bogeychan/elysia-logger";
import { router } from "./routes";

const app = new Elysia()
	.use(helmet())
	.use(
		logger({
			transport: {
				target: "pino-pretty",
				options: {
					colorize: true,
				},
			},
		}),
	)
	.use(router)
	.get("/", ({ log }) => {
		log.info("/ is called");

		return "Hello Elysia";
	});

app.listen(3000, ({ hostname, port }) =>
	console.log(`🦊 Elysia is running at ${hostname}:${port}`),
);
