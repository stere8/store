"use client";
import React, { useState, useEffect } from "react";

type Props = {
  endDate: string;
  className?: string;
};

const Countdown = ({ endDate, className }: Props) => {
  const [time, setTime] = useState("");

  useEffect(() => {
    const countDownDate = new Date(endDate).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = countDownDate - now;

      if (distance < 0) {
        setTime("TIME EXPIRED");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTime(`${days}d : ${hours}h : ${minutes}m : ${seconds}s`);
    };

    updateCountdown(); // run immediately once
    const intervalId = setInterval(updateCountdown, 1000);

    return () => clearInterval(intervalId); // cleanup on unmount
  }, [endDate]);

  return <div className={className}>{time}</div>;
};

export default Countdown;
