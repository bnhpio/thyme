import { Clock } from 'lucide-react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { TimePicker } from './time-picker';

interface TimePickerPopoverProps {
  value: string; // Format: "HH:MM:SS"
  onChange: (value: string) => void;
  placeholder?: string;
}

function formatTimeForDisplay(time: string): string {
  if (!time) return '';
  const parts = time.split(':');
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}${parts[2] ? `:${parts[2]}` : ''}`;
  }
  return time;
}

export function TimePickerPopover({
  value,
  onChange,
  placeholder = 'Pick a time',
}: TimePickerPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start text-left font-normal h-10"
        >
          <Clock className="mr-2 h-4 w-4" />
          {value ? formatTimeForDisplay(value) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <TimePicker value={value || '00:00:00'} onChange={onChange} />
      </PopoverContent>
    </Popover>
  );
}
