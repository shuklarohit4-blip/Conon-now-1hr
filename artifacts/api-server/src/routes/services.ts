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

router.get("/services", async (_req, res) => {
  const services = await collection("services").find().toArray();

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
