import React from "react";
import { Center } from "./center";

interface CircularProgressProps {
  size?: number;
  strokeWidth?: number;
  value: number;
  time: string;
  label?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  size = 85,
  strokeWidth = 4,
  value,
  time,
  label = "Total Hours",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div
      className="overflow-hidden"
      style={{ width: size, height: size, position: "relative" }}
    >
      <svg className="bg-white rounded-full" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#00E676"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s" }}
        />
      </svg>
      <Center className="absolute top-0 left-0 w-full h-full flex-col gap-0">
        <span className="text-gray-500 text-[11px]">{label}</span>
        <span className="text-black text-[13px] font-medium">{time}</span>
      </Center>
    </div>
  );
};
