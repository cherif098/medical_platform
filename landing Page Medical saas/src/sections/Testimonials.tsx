"use client";
import avatar1 from "@/assets/avatar-1.png";
import avatar2 from "@/assets/avatar-2.png";
import avatar3 from "@/assets/avatar-3.png";
import avatar4 from "@/assets/avatar-4.png";
import avatar5 from "@/assets/avatar-5.png";
import avatar6 from "@/assets/avatar-6.png";
import avatar7 from "@/assets/avatar-7.png";
import avatar8 from "@/assets/avatar-8.png";
import avatar9 from "@/assets/avatar-9.png";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";
import React from "react";

const testimonials = [
  {
    text: "Managing patient records has never been easier. This platform centralizes everything, saving us valuable time.",
    imageSrc: avatar1.src,
    name: "Dr. Emily Carter",
    username: "@dremilycarter",
  },
  {
    text: "Our hospital's workflow has become significantly more efficient. Scheduling and resource allocation are now seamless.",
    imageSrc: avatar2.src,
    name: "Michael Johnson",
    username: "@mjohnson_admin",
  },
  {
    text: "With AI-powered tools, we can now predict patient needs more accurately, improving overall care quality.",
    imageSrc: avatar3.src,
    name: "Sarah Mitchell",
    username: "@sarahmitchell_rn",
  },
  {
    text: "Since implementing this system, we've drastically reduced paperwork and administrative errors.",
    imageSrc: avatar4.src,
    name: "Daniel Lee",
    username: "@danlee_hospitalit",
  },
  {
    text: "The platform's intuitive interface has made it easy for all staff members to adapt quickly, from nurses to administrators.",
    imageSrc: avatar5.src,
    name: "Jessica Parker",
    username: "@jessparker_nurse",
  },
  {
    text: "The AI-assisted appointment scheduling has optimized our patient flow, reducing wait times significantly.",
    imageSrc: avatar6.src,
    name: "Dr. Robert Simmons",
    username: "@drrobertsimmons",
  },
  {
    text: "Having a centralized system for all hospital departments has improved collaboration and efficiency.",
    imageSrc: avatar7.src,
    name: "Olivia Thompson",
    username: "@oliviathompson_hr",
  },
  {
    text: "I can now access patient records securely from any device, ensuring better and faster decision-making.",
    imageSrc: avatar8.src,
    name: "William Harris",
    username: "@wharris_medtech",
  },
  {
    text: "This SaaS solution has transformed how we manage medical inventory, reducing waste and optimizing stock levels.",
    imageSrc: avatar9.src,
    name: "Sophia Martinez",
    username: "@smartinez_supply",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

const TestimonialsColumn = (props: {
  className?: string;
  testimonials: typeof testimonials;
  duration?: number;
}) => (
  <div className={props.className}>
    <motion.div
      animate={{
        translateY: "-50%",
      }}
      transition={{
        duration: props.duration || 10,
        repeat: Infinity,
        ease: "linear",
        repeatType: "loop",
      }}
      className="flex flex-col gap-6 pb-6"
    >
      {[...new Array(2)].fill(0).map((_, index) => (
        <React.Fragment key={index}>
          {props.testimonials.map(({ text, imageSrc, name, username }) => (
            <div className="card">
              <div>{text}</div>
              <div className="flex items-center gap-2 mt-5">
                <Image
                  src={imageSrc}
                  alt={name}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full"
                />
                <div className="flex flex-col">
                  <div className="font-medium tracking-tight leading-5">
                    {name}
                  </div>
                  <div className="leading-5 tracking-tight">{username}</div>
                </div>
              </div>
            </div>
          ))}
        </React.Fragment>
      ))}
    </motion.div>
  </div>
);

export const Testimonials = () => {
  return (
    <section className="bg-white">
      <div className="container">
        <div className="section-heading">
          <div className="flex justify-center">
            <div className="tag">Testimonials</div>
          </div>
          <h2 className="section-title mt-5">
            What Healthcare Professionals Say
          </h2>
          <p className="section-description mt-5">
            From seamless patient management to AI-powered automation, our
            platform is transforming hospital operations worldwide.
          </p>
        </div>
        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[738px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn
            testimonials={secondColumn}
            className="hidden md:block"
            duration={19}
          />
          <TestimonialsColumn
            testimonials={thirdColumn}
            className="hidden lg:block"
            duration={17}
          />
        </div>
      </div>
    </section>
  );
};
