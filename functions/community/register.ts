import {Response} from "node-fetch";

export async function onRequest(ctx): Promise<Response> {
    return new Response("Test");
}