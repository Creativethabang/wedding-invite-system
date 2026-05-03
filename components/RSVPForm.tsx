"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

interface FormState {
  name: string;
  attending: boolean | null;
  plus_one: boolean;
  message: string;
}

export default function RSVPForm({ eventId }: { eventId?: string } = {}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const [form, setForm] = useState<FormState>({
    name: "",
    attending: null,
    plus_one: false,
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || form.attending === null) return;

    setLoading(true);
    setError(null);

    const { error: sbError } = await supabase.from("rsvps").insert([
      {
        ...(eventId && { event_id: eventId }),
        name: form.name,
        attending: form.attending,
        plus_one: form.plus_one,
        message: form.message || null,
      },
    ]);

    setLoading(false);

    if (sbError) {
      setError("Something went wrong. Please try again.");
      return;
    }

    setSubmitted(true);
  }

  return (
    <section className="py-32 px-6">
      <div className="mx-auto max-w-lg">
        <motion.div
          ref={ref}
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1 }}
        >
          <p className="font-sans text-xs uppercase tracking-[0.35em] text-gold">
            Kindly Reply
          </p>
          <h2 className="mt-4 font-serif text-5xl font-light text-beige">
            RSVP
          </h2>
        </motion.div>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="confirmation"
              className="text-center"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-6 text-5xl">✦</div>
              <h3 className="font-serif text-3xl font-light text-beige">
                Thank You, {form.name}
              </h3>
              <p className="mt-4 font-sans text-sm text-beige/50">
                {form.attending
                  ? "We can't wait to celebrate with you."
                  : "You'll be missed. Thank you for letting us know."}
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              className="space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Name */}
              <div>
                <label className="block font-sans text-xs uppercase tracking-widest text-beige/50 mb-3">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border-b border-gold/30 bg-transparent py-3 font-serif text-lg text-beige placeholder-beige/20 outline-none focus:border-gold transition-colors"
                  placeholder="Your name"
                />
              </div>

              {/* Attendance */}
              <div>
                <label className="block font-sans text-xs uppercase tracking-widest text-beige/50 mb-4">
                  Will you attend?
                </label>
                <div className="flex gap-4">
                  {[true, false].map((val) => (
                    <button
                      key={String(val)}
                      type="button"
                      onClick={() => setForm({ ...form, attending: val })}
                      className={`flex-1 border py-4 font-sans text-xs uppercase tracking-widest transition-all duration-500 ${
                        form.attending === val
                          ? "border-gold bg-gold/10 text-gold"
                          : "border-beige/10 text-beige/40 hover:border-beige/30"
                      }`}
                    >
                      {val ? "Joyfully accepts" : "Regretfully declines"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Plus one */}
              {form.attending === true && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={form.plus_one}
                      onChange={(e) =>
                        setForm({ ...form, plus_one: e.target.checked })
                      }
                      className="hidden"
                    />
                    <span
                      className={`h-4 w-4 border transition-colors ${
                        form.plus_one ? "border-gold bg-gold" : "border-beige/20"
                      }`}
                    />
                    <span className="font-sans text-xs uppercase tracking-widest text-beige/50 group-hover:text-beige/80 transition-colors">
                      I&apos;ll bring a plus one
                    </span>
                  </label>
                </motion.div>
              )}

              {/* Message */}
              <div>
                <label className="block font-sans text-xs uppercase tracking-widest text-beige/50 mb-3">
                  Message (optional)
                </label>
                <textarea
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full border-b border-gold/30 bg-transparent py-3 font-serif text-lg text-beige placeholder-beige/20 outline-none focus:border-gold transition-colors resize-none"
                  placeholder="A kind word for the couple…"
                />
              </div>

              {error && (
                <p className="font-sans text-xs text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || form.attending === null || !form.name}
                className="w-full border border-gold/40 py-5 font-sans text-xs uppercase tracking-[0.3em] text-gold transition-all duration-500 hover:bg-gold/10 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {loading ? "Sending…" : "Send Reply"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
