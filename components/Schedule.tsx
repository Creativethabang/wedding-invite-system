"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const schedule = [
  { time: "16:30", label: "Doors Open", note: "The Saxon Hotel, Sandhurst" },
  { time: "17:00", label: "Ceremony", note: "Garden Terrace" },
  { time: "18:30", label: "Cocktail Hour", note: "East Lounge" },
  { time: "20:00", label: "Dinner", note: "The Grand Room" },
  { time: "21:30", label: "Dancing", note: "Until the stars go out" },
  { time: "23:00", label: "Last Dance", note: "" },
];

function ScheduleRow({
  item,
  index,
}: {
  item: (typeof schedule)[0];
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.1, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className="flex items-start"
      initial={{ opacity: 0, x: -16 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.9, ease: "easeOut", delay: index * 0.1 }}
    >
      {/* Time */}
      <p className="w-20 shrink-0 pt-1 text-right font-serif text-lg tabular-nums text-gold/70">
        {item.time}
      </p>

      {/* Spine + dot */}
      <div className="relative mx-6 flex flex-col items-center self-stretch">
        <div className="relative z-10 mt-1.5 h-2.5 w-2.5 rounded-full bg-gold/60" />
        {index < schedule.length - 1 && (
          <div className="mt-1 w-px flex-1 bg-gold/15" />
        )}
      </div>

      {/* Label + note */}
      <div className="pb-10">
        <p className="font-serif text-xl font-light text-beige">{item.label}</p>
        {item.note && (
          <p className="mt-1 font-sans text-xs uppercase tracking-wider text-beige/40">
            {item.note}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function Schedule() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, amount: 0.1, margin: "-60px" });

  return (
    <section className="bg-[#0d0c0a] px-6 py-32">
      <div className="mx-auto max-w-xl">
        <motion.div
          ref={headerRef}
          className="mb-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-gold/50">
            The Evening
          </p>
          <h2 className="mt-4 font-serif text-5xl font-light text-beige">
            Order of Events
          </h2>
        </motion.div>

        <div>
          {schedule.map((item, i) => (
            <ScheduleRow key={item.time} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
