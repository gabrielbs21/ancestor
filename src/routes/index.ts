import { Elysia } from "elysia";
import { authRoutes } from "./auth";

const router = new Elysia();

router.group("/auth", (group) => group.use(authRoutes));

export { router };
