"use client";

interface ForecastItemProps {
  hours: number;
  aqi: number | null;
  description: string;
  color: string;
}

export default function ForecastItem({ hours, aqi, description, color }: ForecastItemProps) {
  return (
  <div className="p-3 bg-slate-800/35 rounded flex items-center justify-between border border-white/6">
      <div>
        <div className="text-sm">In {hours}h</div>
        <div className="font-semibold text-lg">{aqi ?? '—'}</div>
        <div className="text-xs text-gray-300">{description}</div>
      </div>
      <div
        className="w-6 h-6 rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}