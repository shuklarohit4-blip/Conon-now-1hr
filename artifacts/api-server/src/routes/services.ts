import { Router, type IRouter } from "express";
import { db, servicesTable, serviceBookingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { BookServiceBody } from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router: IRouter = Router();

router.get("/services", async (_req, res) => {
  const services = await db.select().from(servicesTable);

  res.json(
    services.map((s) => ({
      id: s.externalId,
      type: s.type,
      name: s.name,
      description: s.description,
      ratePerDay: parseFloat(s.ratePerDay),
      available: s.available,
      rating: parseFloat(s.rating ?? "4.5"),
      experience: s.experience,
    }))
  );
});

router.post("/services", async (req, res) => {
  const body = BookServiceBody.parse(req.body);

  const service = await db
    .select()
    .from(servicesTable)
    .where(eq(servicesTable.externalId, body.serviceId))
    .limit(1);

  if (!service[0]) {
    res.status(404).json({ error: "Service not found" });
    return;
  }

  const svc = service[0];
  const total = parseFloat(svc.ratePerDay) * body.days;

  const d = body.date;
  const bookingDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const [booking] = await db
    .insert(serviceBookingsTable)
    .values({
      externalId: randomUUID(),
      serviceId: body.serviceId,
      serviceName: svc.name,
      bookingDate,
      days: body.days,
      total: total.toString(),
      status: "confirmed",
      notes: body.notes ?? null,
    })
    .returning();

  res.json({
    id: booking.externalId,
    serviceId: booking.serviceId,
    serviceName: booking.serviceName,
    date: booking.bookingDate,
    days: booking.days,
    total: parseFloat(booking.total),
    status: booking.status,
  });
});

export default router;
