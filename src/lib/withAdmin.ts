import {NextResponse} from "next/server";
import {getServerSession} from "@/lib/auth";

type RouteHandler<C = unknown> = (req: Request, context: C) => Promise<Response>;

export function withAdmin<C = unknown>(handler: RouteHandler<C>): RouteHandler<C> {
    return async (req: Request, context: C): Promise<Response> => {
        const session = await getServerSession();
        if (session?.user.role !== "admin") {
            return NextResponse.json({error: "Forbidden"}, {status: 403});
        }
        return handler(req, context);
    };
}
