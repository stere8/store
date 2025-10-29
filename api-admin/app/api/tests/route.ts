import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const template = searchParams.get("template");

    const { getToken } = auth();

    if (template) {
      const token = await getToken({ template });
      return Response.json({ token });
    }
  } catch (error) {
    return Response.json({ message: error }, { status: 500 });
  }
}
