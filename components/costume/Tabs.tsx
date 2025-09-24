"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
function Tabs({ tabs }: { tabs: { label: string; comp: React.ReactNode }[] }) {
  const [active, setActive] = useState(0);
  const [size, setSize] = useState<null | number>(null);
  const handleChangeActive = (index: number) => {
    setActive(index);
  };
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tabsRef.current) {
      const box = tabsRef.current.getBoundingClientRect();
      setSize(box.width);
    }
  }, []);

  return (
    <div className=" w-full overflow-hidden">
      <div ref={tabsRef} className=" w-full relative    mb-6  flex ">
        {tabs.map((comp, index) => {
          return (
            <div
              onClick={() => handleChangeActive(index)}
              key={comp.label}
              className={cn(
                " text-muted-foreground transition-all font-medium  cursor-pointer border-b-transparent border-b-[2.5px]  p-2  px-4 ",
                active === index && "border-b-[2.5px] text-foreground z-10 border-primary "
              )}
            >
              {comp.label}
            </div>
          );
        })}
        <div className=" absolute inset-0 pointer-events-none border-b-[2.5px]  " />
      </div>
      {size && (
        <section className="  overflow-hidden">
          <motion.div
            style={{ width: size , maxWidth: size-15 , minWidth: size-15  }}
            initial={{ transform: `translateX(${-active * 100}%)` }}
            className="   flex  transition-all "
            animate={{ transform: `translateX(${-active * 100}%)` }}
          >
            {tabs.map((tab) => {
              return <div className=" p-2   min-w-full     ">{tab.comp}</div>;
            })}
          </motion.div>
        </section>
      )}
    </div>
  );
}

export default Tabs;
