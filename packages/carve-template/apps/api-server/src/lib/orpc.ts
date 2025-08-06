import type { ApiContext } from "@carve/shared-types";
import { ORPCError, os } from "@orpc/server";

export const o = os.$context<ApiContext>();

export const publicProcedure = o;

const requireAuth = o.middleware(async ({ context, next }) => {
	if (!context.auth?.user) {
		throw new ORPCError("UNAUTHORIZED");
	}
	return next({
		context: {
			auth: context.auth,
		},
	});
});

export const protectedProcedure = publicProcedure.use(requireAuth);
