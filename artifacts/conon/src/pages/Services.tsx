import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Briefcase, CheckCircle2, Wrench } from "lucide-react";
import { useGetServices, useBookService, Service } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";

const BRAND = "#1b4366";

export function Services() {
  const { data: services, isLoading } = useGetServices();
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const categories = [
    { id: "foreman", label: "Project Foremen", desc: "Expert site supervision" },
    { id: "plumber", label: "Plumbers", desc: "Piping & water systems" },
    { id: "electrician", label: "Electricians", desc: "Wiring & fixtures" },
    { id: "fitter", label: "Fitters", desc: "Steel & structural work" },
    { id: "daily_labor", label: "Daily Labor", desc: "Heavy lifting & shifting" },
  ];

  return (
    <Layout>
      <div className="p-6 space-y-8 bg-slate-50 min-h-full">
        <header className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: BRAND }}
            >
              <Wrench className="w-4 h-4 text-white" strokeWidth={2.5} />
            </span>
            <h2 className="text-3xl font-display font-bold" style={{ color: BRAND }}>
              Skilled Services
            </h2>
          </div>
          <p className="text-slate-500">Book verified professionals for your site instantly.</p>
        </header>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-2xl" />)}
          </div>
        ) : (
          <div className="space-y-10">
            {categories.map(category => {
              const catServices = services?.filter(s => s.type === category.id) || [];
              if (catServices.length === 0) return null;

              return (
                <section key={category.id}>
                  <div className="mb-4">
                    <h3 className="text-xl font-display font-bold text-slate-800">{category.label}</h3>
                    <p className="text-xs text-slate-500">{category.desc}</p>
                  </div>

                  <div className="grid gap-4 flex-col sm:flex-row sm:overflow-x-auto sm:pb-4 scrollbar-hide">
                    {catServices.map(service => (
                      <div
                        key={service.id}
                        className="bg-white border border-slate-200 rounded-2xl p-5 sm:min-w-[300px] flex-shrink-0 shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-bold text-lg text-slate-800">{service.name}</h4>
                            <div className="flex items-center gap-1 text-sm text-amber-500 font-medium">
                              <Star className="w-4 h-4 fill-current" />
                              {service.rating}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-xl font-display" style={{ color: BRAND }}>
                              ₹{service.ratePerDay}
                            </p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Per Day</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-500 mb-5">
                          <span className="flex items-center bg-slate-100 px-2 py-1 rounded">
                            <Briefcase className="w-3 h-3 mr-1" /> {service.experience} Yrs Exp
                          </span>
                          {service.available ? (
                            <span className="text-green-600 flex items-center font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" /> Available Now
                            </span>
                          ) : (
                            <span className="text-red-500 flex items-center font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5" /> Booked
                            </span>
                          )}
                        </div>

                        <Button
                          className="w-full h-10 text-sm text-white"
                          style={{ background: service.available ? BRAND : undefined }}
                          disabled={!service.available}
                          onClick={() => setSelectedService(service)}
                        >
                          Book Professional
                        </Button>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      <BookingDialog
        service={selectedService}
        onClose={() => setSelectedService(null)}
      />
    </Layout>
  );
}

function BookingDialog({ service, onClose }: { service: Service | null, onClose: () => void }) {
  const [date, setDate] = useState("");
  const [days, setDays] = useState("1");
  const [success, setSuccess] = useState(false);

  const book = useBookService({
    mutation: {
      onSuccess: () => {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 3000);
      }
    }
  });

  const handleBook = () => {
    if (!service || !date || !days) return;
    book.mutate({
      data: {
        serviceId: service.id,
        date,
        days: parseInt(days)
      }
    });
  };

  return (
    <AnimatePresence>
      {service && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }}
            className="fixed bottom-0 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-md w-full bg-white border-t sm:border border-slate-200 sm:rounded-3xl rounded-t-3xl z-50 p-6 shadow-2xl"
          >
            {success ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-2xl font-display text-slate-800 mb-2">Booking Confirmed!</h3>
                <p className="text-slate-500 text-sm">We'll contact you shortly for site details.</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-display font-bold mb-1" style={{ color: BRAND }}>Book {service.name}</h3>
                <p className="text-sm text-slate-500 mb-6">{service.type.replace('_', ' ').toUpperCase()} • ₹{service.ratePerDay}/day</p>

                <div className="space-y-4 mb-8">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Start Date</label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Number of Days</label>
                    <Input
                      type="number"
                      min="1"
                      value={days}
                      onChange={(e) => setDays(e.target.value)}
                    />
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center mt-4">
                    <span className="text-slate-600 font-medium">Estimated Total</span>
                    <span className="text-2xl font-display font-bold" style={{ color: BRAND }}>₹{service.ratePerDay * (parseInt(days) || 1)}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
                  <Button
                    onClick={handleBook}
                    disabled={!date || !days || book.isPending}
                    className="flex-[2] text-white"
                    style={{ background: BRAND }}
                  >
                    {book.isPending ? "Booking..." : "Confirm Booking"}
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
