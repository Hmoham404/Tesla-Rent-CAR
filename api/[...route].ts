import type { IncomingMessage, ServerResponse } from "node:http";
import { createHmac, timingSafeEqual, randomUUID } from "node:crypto";
import {readContent,writeContent,uploadImage} from '../server/content-store';
import { rentalDays, rentalPeriodDays, quote } from "../src/lib/booking.mjs";
const equal = (a: string, b: string) => {
  const aa = Buffer.from(a),
    bb = Buffer.from(b);
  return aa.length === bb.length && timingSafeEqual(aa, bb);
};
const attempts = new Map<string, { count: number; until: number }>();
export default async function handler(
  req: IncomingMessage & { body?: Record<string, unknown> },
  res: ServerResponse,
) {
  const send = (status: number, data: unknown) => {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    res.end(JSON.stringify(data));
  };
  const path = (req.url || "").split("?")[0].replace(/\/$/, "");
  const method = req.method;
  const secret = process.env.ADMIN_SESSION_SECRET || "";
  const code = process.env.ADMIN_ACCESS_CODE || "";
  const secure = process.env.VERCEL ? "; Secure" : "";
  const sign = (value: string) =>
    createHmac("sha256", secret).update(value).digest("hex");
  const token =
    (req.headers.cookie || "")
      .split(";")
      .map((x) => x.trim())
      .find((x) => x.startsWith("tesla_admin="))
      ?.slice(12) || "";
  const [expires, signature] = token.split(".");
  const authenticated =
    secret.length >= 32 &&
    Number(expires) > Date.now() &&
    equal(sign(expires || ""), signature || "");
  if(path.startsWith('/api/admin/') && !['/api/admin/login','/api/admin/logout'].includes(path) && !authenticated) return send(401,{error:'Connexion administrateur requise.'});
  if (method !== "GET") {
    const origin = req.headers.origin;
    if (
      origin &&
      origin !== `http://${req.headers.host}` &&
      origin !== `https://${req.headers.host}`
    )
      return send(403, { error: "Origine non autorisée." });
  }
  let body: Record<string, unknown> = req.body || {};
  try {
    if (method !== "GET" && !req.body) {
      let raw = "";
      for await (const chunk of req) {
        raw += chunk;
        if (raw.length > (path === '/api/admin/media' ? 2900000 : path === '/api/admin/content' ? 512000 : 16000))
          return send(413, { error: "Demande trop volumineuse." });
      }
      body = raw ? JSON.parse(raw) : {};
    }
    if (!body || typeof body !== "object" || Array.isArray(body))
      return send(400, { error: "Format de demande invalide." });
    if (path === "/api/admin/login" && method === "POST") {
      if (!code || secret.length < 32)
        return send(503, {
          error:
            "Configurez ADMIN_ACCESS_CODE et ADMIN_SESSION_SECRET sur le serveur.",
        });
      const ip = String(
        req.headers["x-forwarded-for"] || req.socket.remoteAddress || "local",
      ).split(",")[0];
      const attempt = attempts.get(ip);
      if (attempt && attempt.until > Date.now() && attempt.count >= 8)
        return send(429, {
          error: "Trop de tentatives. Réessayez dans 15 minutes.",
        });
      if (typeof body.code !== "string" || !equal(body.code, code)) {
        attempts.set(ip, {
          count: attempt && attempt.until > Date.now() ? attempt.count + 1 : 1,
          until: Date.now() + 900000,
        });
        return send(401, { error: "Code d’accès incorrect." });
      }
      attempts.delete(ip);
      const exp = String(Date.now() + 28800000);
      res.setHeader(
        "Set-Cookie",
        `tesla_admin=${exp}.${sign(exp)}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=28800${secure}`,
      );
      return send(200, { ok: true });
    }
    if (path === "/api/admin/logout" && method === "POST") {
      res.setHeader(
        "Set-Cookie",
        `tesla_admin=; HttpOnly; SameSite=Strict; Path=/api; Max-Age=0${secure}`,
      );
      return send(200, { ok: true });
    }
    if (path.startsWith("/api/admin/") && !authenticated)
      return send(401, { error: "Connexion administrateur requise." });
    if (path === "/api/admin/session" && method === "GET")
      return send(200, { ok: true });
    if(path==='/api/content' && method==='GET')return send(200,{content:await readContent()});
    if(path==='/api/admin/content' && method==='PUT'){
      if(JSON.stringify(body).length>512000)return send(413,{error:'Contenu trop volumineux.'});
      try{await writeContent(body);return send(200,{ok:true});}catch(e){return send(400,{error:(e as Error).message});}
    }
    if(path==='/api/admin/media' && method==='POST')return send(201,{url:await uploadImage(body.data)});
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const db = async (query: string, init: RequestInit = {}) => {
      if (!url || !key)
        throw new Error(
          "Supabase non activé : configurez la clé serveur et exécutez supabase/schema.sql.",
        );
      const response = await fetch(`${url}/rest/v1/${query}`, {
        ...init,
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          ...init.headers,
        },
      });
      if (!response.ok) {
        console.error("Supabase response status", response.status);
        throw new Error(
          "La base est indisponible. Vérifiez le schéma et les variables serveur.",
        );
      }
      return response.status === 204 ||
        response.headers.get("content-length") === "0"
        ? null
        : response.json();
    };
    if (path === "/api/bookings" && method === "POST") {
      const car = (await readContent()).vehicles.find((c) => c.id === body.vehicleId && c.active!==false);
      const today = new Date().toISOString().slice(0, 10);
      const days = rentalDays(String(body.start), String(body.end));
      if (
        !car ||
        !days ||
        String(body.start) < today ||
        typeof body.name !== "string" ||
        body.name.trim().length < 2 ||
        body.name.length > 120 ||
        typeof body.email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) ||
        body.email.length > 180 ||
        typeof body.phone !== "string" ||
        !/^[+\d\s().-]{8,30}$/.test(body.phone) ||
        ![
          "Agence TESLA",
          "Livraison à convenir",
          "Aéroport de Monastir",
          "Aéroport d’Enfidha",
        ].includes(String(body.location)) ||
        typeof body.insurance !== "boolean"
      )
        return send(400, { error: "Dates ou coordonnées invalides." });
      const startTime =
        typeof body.startTime === "string" ? body.startTime : "10:00";
      const endTime = typeof body.endTime === "string" ? body.endTime : "10:00";
      const returnLocation = body.returnLocation || body.location;
      const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
      if (
        !timePattern.test(startTime) ||
        !timePattern.test(endTime) ||
        ![
          "Agence TESLA",
          "Livraison à convenir",
          "Aéroport de Monastir",
          "Aéroport d’Enfidha",
        ].includes(String(returnLocation))
      )
        return send(400, { error: "Horaires ou lieu de retour invalides." });
      const billedDays = rentalPeriodDays(
        String(body.start),
        String(body.end),
        startTime,
        endTime,
      );
      if (!billedDays)
        return send(400, { error: "Durée de location invalide." });
      const booking = {
        id: randomUUID(),
        vehicleId: car.id,
        vehicleName: `${car.brand} ${car.name}`,
        start: body.start,
        end: body.end,
        startTime,
        endTime,
        location: body.location,
        returnLocation,
        name: body.name.trim(),
        email: body.email.trim(),
        phone: body.phone.trim(),
        insurance: body.insurance,
        total: quote(car.price, billedDays, body.insurance),
        status: "En attente",
        createdAt: new Date().toISOString(),
      };
      await db("bookings", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ id: booking.id, payload: booking }),
      });
      return send(201, { ok: true, id: booking.id });
    }
    if (path === "/api/admin/bookings" && method === "GET") {
      const rows = await db(
        "bookings?select=id,payload&order=created_at.desc&limit=500",
      );
      return send(200, {
        bookings: rows.map(
          (r: { id: string; payload: Record<string, unknown> }) => ({
            ...r.payload,
            id: r.id,
          }),
        ),
      });
    }
    if (path === "/api/admin/bookings" && method === "PATCH") {
      if (
        typeof body.id !== "string" ||
        !/^[a-f0-9-]{36}$/.test(body.id) ||
        !["En attente", "Confirmée", "Annulée"].includes(String(body.status))
      )
        return send(400, { error: "Modification invalide." });
      const rows = await db(`bookings?id=eq.${body.id}&select=payload`);
      if (!rows.length) return send(404, { error: "Demande introuvable." });
      await db(`bookings?id=eq.${body.id}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          payload: { ...rows[0].payload, status: body.status },
        }),
      });
      return send(200, { ok: true });
    }
    return send(404, { error: "Route introuvable." });
  } catch (e) {
    if (e instanceof SyntaxError)
      return send(400, { error: "Format de demande invalide." });
    return send(503, {
      error: e instanceof Error ? e.message : "Service indisponible.",
    });
  }
}
