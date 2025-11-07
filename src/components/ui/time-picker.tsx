import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

interface TimePickerProps {
  value: string; // Format: "HH:MM:SS"
  onChange: (value: string) => void;
  className?: string;
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const [hours, setHours] = useState(() => {
    return value ? value.split(':')[0] || '00' : '00';
  });
  const [minutes, setMinutes] = useState(() => {
    return value ? value.split(':')[1] || '00' : '00';
  });
  const [seconds, setSeconds] = useState(() => {
    return value ? value.split(':')[2] || '00' : '00';
  });

  useEffect(() => {
    const parts = value ? value.split(':') : ['00', '00', '00'];
    setHours(parts[0] || '00');
    setMinutes(parts[1] || '00');
    setSeconds(parts[2] || '00');
  }, [value]);

  const updateTime = (
    newHours: string,
    newMinutes: string,
    newSeconds: string,
  ) => {
    const h = newHours.padStart(2, '0');
    const m = newMinutes.padStart(2, '0');
    const s = newSeconds.padStart(2, '0');
    onChange(`${h}:${m}:${s}`);
  };

  const handleHoursChange = (newHours: string) => {
    setHours(newHours);
    updateTime(newHours, minutes, seconds);
  };

  const handleMinutesChange = (newMinutes: string) => {
    setMinutes(newMinutes);
    updateTime(hours, newMinutes, seconds);
  };

  const handleSecondsChange = (newSeconds: string) => {
    setSeconds(newSeconds);
    updateTime(hours, minutes, newSeconds);
  };

  const hourOptions = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, '0'),
  );
  const minuteOptions = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, '0'),
  );
  const secondOptions = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, '0'),
  );

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <Select value={hours} onValueChange={handleHoursChange}>
          <SelectTrigger className="w-20 h-10 text-base font-mono font-semibold bg-background hover:bg-accent transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {hourOptions.map((hour) => (
              <SelectItem
                key={hour}
                value={hour}
                className={`font-mono text-center justify-center pr-2 [&>span:first-child]:hidden ${
                  hours === hour ? 'bg-primary text-primary-foreground' : ''
                }`}
              >
                {hour}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="text-xl font-bold text-muted-foreground leading-none">
          :
        </div>

        <Select value={minutes} onValueChange={handleMinutesChange}>
          <SelectTrigger className="w-20 h-10 text-base font-mono font-semibold bg-background hover:bg-accent transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {minuteOptions.map((minute) => (
              <SelectItem
                key={minute}
                value={minute}
                className={`font-mono text-center justify-center pr-2 [&>span:first-child]:hidden ${
                  minutes === minute ? 'bg-primary text-primary-foreground' : ''
                }`}
              >
                {minute}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="text-xl font-bold text-muted-foreground leading-none">
          :
        </div>

        <Select value={seconds} onValueChange={handleSecondsChange}>
          <SelectTrigger className="w-20 h-10 text-base font-mono font-semibold bg-background hover:bg-accent transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {secondOptions.map((second) => (
              <SelectItem
                key={second}
                value={second}
                className={`font-mono text-center justify-center pr-2 [&>span:first-child]:hidden ${
                  seconds === second ? 'bg-primary text-primary-foreground' : ''
                }`}
              >
                {second}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
