import { Router, type IRouter } from "express";
import {
  centsToDecimal,
  collection,
  decimal,
  decimalToNumber,
  moneyToCents,
  nextId,
} from "@workspace/db";
import { BookServiceBody } from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router: IRouter = Router();

const FALLBACK_SERVICES = [
  { id: "srv-foreman", type: "foreman", name: "Senior Site Foreman (Civil)", description: "Civil engineering supervision & layout planning.", ratePerDay: 1800, available: true, rating: 4.9, experience: 14 },
  { id: "srv-plumber", type: "plumber", name: "Master Plumber", description: "CPVC/UPVC pipe fitting, sanitaryware installation.", ratePerDay: 1050, available: true, rating: 4.7, experience: 10 },
  { id: "srv-electrician", type: "electrician", name: "Certified Electrician", description: "Concealed wiring, DB dressing, switchboards.", ratePerDay: 1100, available: true, rating: 4.9, experience: 8 },
  { id: "srv-fitter", type: "fitter", name: "Bar Bender & Steel Fitter", description: "TMT cutting, bending, rebar mesh & column cages.", ratePerDay: 1150, available: true, rating: 4.8, experience: 11 },
  { id: "srv-daily-labor", type: "daily_labor", name: "Construction Helper (Beldar)", description: "Material mixing, carrying, and site cleanup.", ratePerDay: 700, available: true, rating: 4.6, experience: 5 },
];

router.get("/services", async (_req, res, next) => {
  try {
    const services = await collection("services").find().toArray();
    if (services.length === 0 && process.env.NODE_ENV !== "production") {
      res.json(FALLBACK_SERVICES);
      return;
    }

    res.json(
      services.map((s) => ({
        id: s.externalId,
        type: s.type,
        name: s.name,
        description: s.description,
        ratePerDay: decimalToNumber(s.ratePerDay),
        available: s.available,
        rating: decimalToNumber(s.rating ?? decimal("4.5")),
        experience: s.experience,
      }))
    );
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      res.json(FALLBACK_SERVICES);
      return;
    }
    next(err);
  }
});

router.post("/services", async (req, res) => {
  const body = BookServiceBody.parse(req.body);

  const service = await collection("services").findOne({ externalId: body.serviceId });

  if (!service) {
    res.status(404).json({ error: "Service not found" });
    return;
  }

  const svc = service;
  const total = centsToDecimal(moneyToCents(svc.ratePerDay) * BigInt(body.days));

  const d = body.date;
  const bookingDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const booking = {
      id: await nextId("serviceBookings"),
      externalId: randomUUID(),
      serviceId: body.serviceId,
      serviceName: svc.name,
      bookingDate,
      days: body.days,
      total,
      status: "confirmed",
      notes: body.notes ?? null,
      createdAt: new Date(),
    };
  await collection("serviceBookings").insertOne(booking);

  res.json({
    id: booking.externalId,
    serviceId: booking.serviceId,
    serviceName: booking.serviceName,
    date: booking.bookingDate,
    days: booking.days,
    total: decimalToNumber(booking.total),
    status: booking.status,
  });
});

export default router;
