"use client";

import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

type QuantityCounterProps = {
  value: number;
  max: number;
  onChange: (value: number) => void;
};

const QuantityCounter = ({ value, max, onChange }: QuantityCounterProps) => {
  const decrease = () => {
    if (value > 1) onChange(value - 1);
  };

  const increase = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="icon"
        onClick={decrease}
        disabled={value <= 1}
        className="text-white"
      >
        <Minus size={18} />
      </Button>

      <span className="w-8 text-center font-medium">{value}</span>

      <Button
        variant="outline"
        size="icon"
        onClick={increase}
        disabled={value >= max}
        className="text-white"
      >
        <Plus size={18} />
      </Button>
    </div>
  );
};

export default QuantityCounter;
