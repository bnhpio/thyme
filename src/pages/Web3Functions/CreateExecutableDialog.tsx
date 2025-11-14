import { useForm } from '@tanstack/react-form';
import { useAction, useQuery } from 'convex/react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Repeat } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import * as viemChains from 'viem/chains';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { TimePickerPopover } from '@/components/ui/time-picker-popover';
import { parseOpenAPISchema, type SchemaField } from './schema-utils';

interface CreateExecutableDialogProps {
  taskId: Id<'tasks'>;
  storageId: Id<'_storage'>;
  organizationId: Id<'organizations'>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function getChainName(chainId: number): string {
  const chain = Object.values(viemChains).find(
    (c: any) => c.id === chainId,
  ) as any;
  return chain?.name || `Chain ${chainId}`;
}

function getDefaultDate() {
  return new Date(Date.now() + 60 * 60 * 1000);
}

function getDefaultTime() {
  const date = new Date(Date.now() + 60 * 60 * 1000);
  // Return UTC time
  const utcDate = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
    ),
  );
  return format(utcDate, 'HH:mm:ss');
}

function getLocalTimeFromUTC(
  date: Date | undefined,
  time: string,
): string | null {
  if (!date || !time) return null;
  const [hours, minutes, seconds] = time.split(':');
  // Create UTC date/time
  const utcDate = new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      Number.parseInt(hours, 10),
      Number.parseInt(minutes, 10),
      Number.parseInt(seconds || '0', 10),
    ),
  );

  // Format UTC time (show what user entered)
  const utcTimeStr = `${format(date, 'PPP')} ${hours}:${minutes}:${seconds} UTC`;

  // Format local time (date-fns formats in local timezone by default)
  const localTimeStr = format(utcDate, 'PPP p');

  return `${utcTimeStr} → ${localTimeStr} (your timezone)`;
}

function isDateTimeInPast(date: Date | undefined, time: string): boolean {
  if (!date || !time) return false;
  const [hours, minutes, seconds] = time.split(':');
  // Create UTC date/time
  const utcDate = new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      Number.parseInt(hours, 10),
      Number.parseInt(minutes, 10),
      Number.parseInt(seconds || '0', 10),
    ),
  );
  return utcDate.getTime() < Date.now();
}

function renderSchemaField(
  field: SchemaField,
  value: unknown,
  onChange: (value: unknown) => void,
) {
  const fieldValue = value ?? field.default ?? '';

  switch (field.type) {
    case 'boolean':
      return (
        <div className="flex items-center space-x-2">
          <Switch
            checked={Boolean(fieldValue)}
            onCheckedChange={(checked) => onChange(checked)}
          />
          <Label className="text-sm font-normal">
            {field.description || field.name}
          </Label>
        </div>
      );

    case 'integer':
    case 'number':
      return (
        <Input
          type="number"
          value={String(fieldValue)}
          onChange={(e) =>
            onChange(
              field.type === 'integer'
                ? Number.parseInt(e.target.value, 10)
                : Number.parseFloat(e.target.value),
            )
          }
          placeholder={field.description}
          min={field.minimum}
          max={field.maximum}
          className="h-10"
        />
      );

    case 'array':
      return (
        <Textarea
          value={
            Array.isArray(fieldValue)
              ? JSON.stringify(fieldValue, null, 2)
              : String(fieldValue)
          }
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              onChange(parsed);
            } catch {
              onChange(e.target.value);
            }
          }}
          placeholder={field.description || 'Enter array as JSON'}
          className="min-h-20 font-mono text-sm"
        />
      );

    case 'object':
      return (
        <Textarea
          value={
            typeof fieldValue === 'object'
              ? JSON.stringify(fieldValue, null, 2)
              : String(fieldValue)
          }
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              onChange(parsed);
            } catch {
              onChange(e.target.value);
            }
          }}
          placeholder={field.description || 'Enter object as JSON'}
          className="min-h-24 font-mono text-sm"
        />
      );

    default:
      if (field.enum) {
        return (
          <Select
            value={String(fieldValue)}
            onValueChange={(val) => onChange(val)}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder={field.description} />
            </SelectTrigger>
            <SelectContent>
              {field.enum.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }

      if (
        field.format === 'textarea' ||
        (field.maxLength && field.maxLength > 100)
      ) {
        return (
          <Textarea
            value={String(fieldValue)}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.description}
            maxLength={field.maxLength}
            className="min-h-20"
          />
        );
      }

      return (
        <Input
          type={field.format === 'email' ? 'email' : 'text'}
          value={String(fieldValue)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.description}
          minLength={field.minLength}
          maxLength={field.maxLength}
          pattern={field.pattern}
          className="h-10"
        />
      );
  }
}

export function CreateExecutableDialog({
  taskId,
  storageId,
  organizationId,
  isOpen,
  onOpenChange,
  onSuccess,
}: CreateExecutableDialogProps) {
  const createExecutable = useAction(api.action.executable.createExecutable);
  const getTaskSchema = useAction(api.action.task.getTaskSchema);
  const chains = useQuery(api.query.chain.getAllChains, {});
  const profiles = useQuery(api.query.profile.getProfilesByOrganization, {
    organizationId,
  });

  const [schemaFields, setSchemaFields] = useState<SchemaField[]>([]);
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);

  // Initialize form with dynamic schema fields
  const getInitialArgs = () => {
    const args: Record<string, unknown> = {};
    schemaFields.forEach((field) => {
      if (field.default !== undefined) {
        args[field.name] = field.default;
      } else if (field.type === 'array') {
        args[field.name] = [];
      } else if (field.type === 'object') {
        args[field.name] = {};
      } else if (field.type === 'boolean') {
        args[field.name] = false;
      } else {
        args[field.name] = '';
      }
    });
    return args;
  };

  const form = useForm({
    defaultValues: {
      name: '' as string,
      triggerType: 'single' as 'single' | 'cron',
      selectedChainId: '' as Id<'chains'> | '',
      selectedProfileId: '' as Id<'profiles'> | '',
      args: getInitialArgs(),
      withRetry: false,
      singleRunDate: getDefaultDate() as Date | undefined,
      singleRunTime: getDefaultTime(),
      cronSchedule: '',
      cronUntilDate: undefined as Date | undefined,
      cronUntilTime: '',
    },
    onSubmit: async ({ value }) => {
      if (!value.name || !value.name.trim()) {
        toast.error('Please enter a task name');
        return;
      }

      if (!value.selectedChainId) {
        toast.error('Please select a chain');
        return;
      }

      if (!value.selectedProfileId) {
        toast.error('Please select a profile');
        return;
      }

      let trigger:
        | {
            type: 'single';
            timestamp: number;
            withRetry: boolean;
          }
        | {
            type: 'cron';
            schedule: string;
            withRetry: boolean;
            until?: number;
          };

      if (value.triggerType === 'single') {
        if (!value.singleRunDate || !value.singleRunTime) {
          toast.error('Please specify when the function should run');
          return;
        }

        const [hours, minutes, seconds] = value.singleRunTime.split(':');
        // Create UTC date/time from the selected date and UTC time
        const dateTime = new Date(
          Date.UTC(
            value.singleRunDate.getFullYear(),
            value.singleRunDate.getMonth(),
            value.singleRunDate.getDate(),
            Number.parseInt(hours, 10),
            Number.parseInt(minutes, 10),
            Number.parseInt(seconds || '0', 10),
          ),
        );

        const timestamp = dateTime.getTime();

        if (timestamp < Date.now()) {
          toast.error('The specified time must be in the future');
          return;
        }

        trigger = {
          type: 'single',
          timestamp,
          withRetry: value.withRetry,
        };
      } else {
        if (!value.cronSchedule.trim()) {
          toast.error('Please enter a cron schedule');
          return;
        }

        let until: number | undefined;
        if (value.cronUntilDate && value.cronUntilTime) {
          const [hours, minutes, seconds] = value.cronUntilTime.split(':');
          // Create UTC date/time from the selected date and UTC time
          const untilDateTime = new Date(
            Date.UTC(
              value.cronUntilDate.getFullYear(),
              value.cronUntilDate.getMonth(),
              value.cronUntilDate.getDate(),
              Number.parseInt(hours, 10),
              Number.parseInt(minutes, 10),
              Number.parseInt(seconds || '0', 10),
            ),
          );
          until = untilDateTime.getTime();

          if (until < Date.now()) {
            toast.error('The "until" date must be in the future');
            return;
          }
        }

        trigger = {
          type: 'cron',
          schedule: value.cronSchedule.trim(),
          withRetry: value.withRetry,
          until,
        };
      }

      try {
        await createExecutable({
          taskId,
          name: value.name.trim(),
          organizationId,
          chainId: value.selectedChainId as Id<'chains'>,
          profileId: value.selectedProfileId as Id<'profiles'>,
          args: JSON.stringify(value.args),
          trigger,
        });

        toast.success('Executable task created successfully');
        onOpenChange(false);
        form.reset();
        onSuccess();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to create executable task',
        );
      }
    },
  });

  // Fetch schema when dialog opens
  useEffect(() => {
    if (isOpen && storageId) {
      setIsLoadingSchema(true);
      getTaskSchema({ storageId })
        .then((schemaJson) => {
          if (schemaJson) {
            const fields = parseOpenAPISchema(schemaJson);
            setSchemaFields(fields);
            // Reset args with new schema
            const initialArgs = getInitialArgs();
            form.setFieldValue('args', initialArgs);
          }
        })
        .catch((error) => {
          console.error('Failed to load schema:', error);
          setSchemaFields([]);
        })
        .finally(() => {
          setIsLoadingSchema(false);
        });
    }
  }, [isOpen, storageId, getTaskSchema]);

  useEffect(() => {
    if (isOpen) {
      form.reset();
      form.setFieldValue('singleRunDate', getDefaultDate());
      form.setFieldValue('singleRunTime', getDefaultTime());
      form.setFieldValue('cronUntilDate', undefined);
      form.setFieldValue('cronUntilTime', '');
      form.setFieldValue('args', getInitialArgs());
    }
  }, [isOpen, form, schemaFields]);

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      form.reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Executable Task</DialogTitle>
          <DialogDescription>
            Configure when and how this function should be executed
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="space-y-6 py-4">
            {/* Name Field */}
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) => {
                  if (!value || !value.trim()) {
                    return 'Task name is required';
                  }
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div className="space-y-2.5">
                  <Label className="text-sm font-medium">
                    Task Name
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="e.g., Daily Price Check"
                    className="h-10"
                  />
                  {field.state.meta.errors && (
                    <p className="text-xs text-destructive">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Give this executable task a descriptive name
                  </p>
                </div>
              )}
            </form.Field>

            <Separator />

            {/* Trigger Type Cards */}
            <form.Field name="triggerType">
              {(field) => (
                <div className="space-y-2.5">
                  <Label className="text-sm font-medium">Trigger Type</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Card
                      className={`cursor-pointer transition-all hover:border-primary ${
                        field.state.value === 'single'
                          ? 'border-primary bg-primary/5'
                          : ''
                      }`}
                      onClick={() => field.handleChange('single')}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          <CardTitle className="text-base">
                            Single Run
                          </CardTitle>
                        </div>
                        <CardDescription className="text-xs">
                          Execute the function once at a specific time
                        </CardDescription>
                      </CardHeader>
                    </Card>
                    <Card
                      className={`cursor-pointer transition-all hover:border-primary ${
                        field.state.value === 'cron'
                          ? 'border-primary bg-primary/5'
                          : ''
                      }`}
                      onClick={() => field.handleChange('cron')}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <Repeat className="h-5 w-5" />
                          <CardTitle className="text-base">
                            Cron Schedule
                          </CardTitle>
                        </div>
                        <CardDescription className="text-xs">
                          Execute the function on a recurring schedule
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </div>
                </div>
              )}
            </form.Field>

            {/* Trigger Configuration */}
            <form.Subscribe selector={(state) => state.values.triggerType}>
              {(triggerType) =>
                triggerType === 'single' ? (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                    <h3 className="text-sm font-semibold">
                      Single Run Configuration
                    </h3>
                    <form.Field name="singleRunDate">
                      {(field) => (
                        <form.Field name="singleRunTime">
                          {(timeField) => {
                            const isPast = isDateTimeInPast(
                              field.state.value,
                              timeField.state.value,
                            );
                            return (
                              <div className="space-y-2.5">
                                <Label className="text-sm font-medium">
                                  Run Date
                                </Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className="w-full justify-start text-left font-normal h-10"
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {field.state.value &&
                                      field.state.value instanceof Date &&
                                      !Number.isNaN(
                                        field.state.value.getTime(),
                                      ) ? (
                                        format(field.state.value, 'PPP')
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                  >
                                    <Calendar
                                      mode="single"
                                      selected={
                                        field.state.value &&
                                        field.state.value instanceof Date &&
                                        !Number.isNaN(
                                          field.state.value.getTime(),
                                        )
                                          ? field.state.value
                                          : undefined
                                      }
                                      onSelect={(date) => {
                                        field.handleChange(date);
                                        // Check if combined date+time is in past
                                        if (
                                          date &&
                                          timeField.state.value &&
                                          isDateTimeInPast(
                                            date,
                                            timeField.state.value,
                                          )
                                        ) {
                                          toast.error(
                                            'The selected date and time must be in the future',
                                          );
                                        }
                                      }}
                                      disabled={(date) => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        return date < today;
                                      }}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                {isPast && (
                                  <p className="text-xs text-destructive">
                                    The selected date and time is in the past
                                  </p>
                                )}
                              </div>
                            );
                          }}
                        </form.Field>
                      )}
                    </form.Field>
                    <form.Field name="singleRunDate">
                      {(dateField) => (
                        <form.Field name="singleRunTime">
                          {(field) => {
                            const localTimeDisplay = getLocalTimeFromUTC(
                              dateField.state.value,
                              field.state.value,
                            );
                            const isPast = isDateTimeInPast(
                              dateField.state.value,
                              field.state.value,
                            );
                            return (
                              <div className="space-y-2.5">
                                <Label className="text-sm font-medium">
                                  Run Time (UTC)
                                </Label>
                                <TimePickerPopover
                                  value={field.state.value}
                                  onChange={(value) => {
                                    field.handleChange(value);
                                    // Check if combined date+time is in past
                                    if (
                                      dateField.state.value &&
                                      value &&
                                      isDateTimeInPast(
                                        dateField.state.value,
                                        value,
                                      )
                                    ) {
                                      toast.error(
                                        'The selected date and time must be in the future',
                                      );
                                    }
                                  }}
                                  placeholder="Pick a time"
                                />
                                {localTimeDisplay && (
                                  <p className="text-xs text-muted-foreground">
                                    {localTimeDisplay}
                                  </p>
                                )}
                                {isPast && (
                                  <p className="text-xs text-destructive">
                                    The selected date and time is in the past
                                  </p>
                                )}
                              </div>
                            );
                          }}
                        </form.Field>
                      )}
                    </form.Field>
                  </div>
                ) : (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                    <h3 className="text-sm font-semibold">
                      Cron Schedule Configuration
                    </h3>
                    <form.Field name="cronSchedule">
                      {(field) => (
                        <div className="space-y-2.5">
                          <Label className="text-sm font-medium">
                            Cron Schedule
                          </Label>
                          <Input
                            placeholder="e.g., 0 0 * * * (daily at midnight)"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className="h-10"
                          />
                          <p className="text-xs text-muted-foreground">
                            Use standard cron format: minute hour day month
                            weekday
                          </p>
                        </div>
                      )}
                    </form.Field>
                    <form.Field name="cronUntilDate">
                      {(field) => (
                        <form.Field name="cronUntilTime">
                          {(timeField) => {
                            const localTimeDisplay = getLocalTimeFromUTC(
                              field.state.value,
                              timeField.state.value || '00:00:00',
                            );
                            const isPast = isDateTimeInPast(
                              field.state.value,
                              timeField.state.value || '00:00:00',
                            );
                            return (
                              <div className="space-y-2.5">
                                <Label className="text-sm font-medium">
                                  Run Until (Optional)
                                </Label>
                                <div className="flex gap-2">
                                  <div className="flex-1">
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          className="w-full justify-start text-left font-normal h-10"
                                        >
                                          <CalendarIcon className="mr-2 h-4 w-4" />
                                          {field.state.value &&
                                          field.state.value instanceof Date &&
                                          !Number.isNaN(
                                            field.state.value.getTime(),
                                          ) ? (
                                            format(field.state.value, 'PPP')
                                          ) : (
                                            <span>Pick a date</span>
                                          )}
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                      >
                                        <Calendar
                                          mode="single"
                                          selected={
                                            field.state.value &&
                                            field.state.value instanceof Date &&
                                            !Number.isNaN(
                                              field.state.value.getTime(),
                                            )
                                              ? field.state.value
                                              : undefined
                                          }
                                          onSelect={(date) => {
                                            field.handleChange(date);
                                            // Check if combined date+time is in past
                                            if (
                                              date &&
                                              timeField.state.value &&
                                              isDateTimeInPast(
                                                date,
                                                timeField.state.value,
                                              )
                                            ) {
                                              toast.error(
                                                'The selected date and time must be in the future',
                                              );
                                            }
                                          }}
                                          disabled={(date) => {
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);
                                            return date < today;
                                          }}
                                          initialFocus
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                  <div className="flex-1">
                                    <TimePickerPopover
                                      value={
                                        timeField.state.value || '00:00:00'
                                      }
                                      onChange={(value) => {
                                        timeField.handleChange(value);
                                        // Check if combined date+time is in past
                                        if (
                                          field.state.value &&
                                          value &&
                                          isDateTimeInPast(
                                            field.state.value,
                                            value,
                                          )
                                        ) {
                                          toast.error(
                                            'The selected date and time must be in the future',
                                          );
                                        }
                                      }}
                                      placeholder="Pick a time (UTC)"
                                    />
                                  </div>
                                </div>
                                {localTimeDisplay && (
                                  <p className="text-xs text-muted-foreground">
                                    {localTimeDisplay}
                                  </p>
                                )}
                                {isPast && (
                                  <p className="text-xs text-destructive">
                                    The selected date and time is in the past
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                  If specified, the function will stop running
                                  after this date and time
                                </p>
                              </div>
                            );
                          }}
                        </form.Field>
                      )}
                    </form.Field>
                  </div>
                )
              }
            </form.Subscribe>

            <Separator />

            {/* Chain and Profile */}
            <div className="grid grid-cols-2 gap-4">
              <form.Field name="selectedChainId">
                {(field) => (
                  <div className="space-y-2.5">
                    <Label className="text-sm font-medium">Chain</Label>
                    {chains === undefined ? (
                      <div className="h-10 flex items-center text-sm text-muted-foreground">
                        Loading chains...
                      </div>
                    ) : chains.length === 0 ? (
                      <div className="h-10 flex items-center text-sm text-muted-foreground">
                        No chains available
                      </div>
                    ) : (
                      <Select
                        value={field.state.value}
                        onValueChange={(value) =>
                          field.handleChange(value as Id<'chains'>)
                        }
                      >
                        <SelectTrigger className="w-full h-10">
                          <SelectValue placeholder="Select a chain" />
                        </SelectTrigger>
                        <SelectContent>
                          {chains
                            .sort((a, b) => a.chainId - b.chainId)
                            .map((chain) => (
                              <SelectItem key={chain._id} value={chain._id}>
                                {getChainName(chain.chainId)} ({chain.chainId})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field name="selectedProfileId">
                {(field) => (
                  <div className="space-y-2.5">
                    <Label className="text-sm font-medium">Profile</Label>
                    {profiles === undefined ? (
                      <div className="h-10 flex items-center text-sm text-muted-foreground">
                        Loading profiles...
                      </div>
                    ) : profiles.length === 0 ? (
                      <div className="h-10 flex items-center text-sm text-muted-foreground">
                        No profiles available
                      </div>
                    ) : (
                      <Select
                        value={field.state.value}
                        onValueChange={(value) =>
                          field.handleChange(value as Id<'profiles'>)
                        }
                      >
                        <SelectTrigger className="w-full h-10">
                          <SelectValue placeholder="Select a profile" />
                        </SelectTrigger>
                        <SelectContent>
                          {profiles.map((profile) => (
                            <SelectItem key={profile._id} value={profile._id}>
                              {profile.alias} (Chain {profile.chainId})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}
              </form.Field>
            </div>

            <Separator />

            {/* Schema-based Arguments */}
            {isLoadingSchema ? (
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Loading function schema...
                </p>
              </div>
            ) : schemaFields.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">
                    Function Arguments
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Configure the parameters for this function
                  </p>
                </div>
                <form.Field name="args">
                  {(field) => (
                    <div className="space-y-4">
                      {schemaFields.map((schemaField) => (
                        <div key={schemaField.name} className="space-y-2.5">
                          <Label className="text-sm font-medium">
                            {schemaField.name}
                            {schemaField.required && (
                              <span className="text-destructive ml-1">*</span>
                            )}
                          </Label>
                          {schemaField.description && (
                            <p className="text-xs text-muted-foreground">
                              {schemaField.description}
                            </p>
                          )}
                          {renderSchemaField(
                            schemaField,
                            (field.state.value as Record<string, unknown>)?.[
                              schemaField.name
                            ],
                            (value) => {
                              const currentArgs = {
                                ...(field.state.value as Record<
                                  string,
                                  unknown
                                >),
                              };
                              currentArgs[schemaField.name] = value;
                              field.handleChange(currentArgs);
                            },
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </form.Field>
              </div>
            ) : (
              <div className="p-4 border rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  No schema available. Arguments will be passed as empty object.
                </p>
              </div>
            )}

            <Separator />

            {/* Retry on Failure - Moved to bottom */}
            <form.Field name="withRetry">
              {(field) => (
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">
                      Retry on Failure
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically retry if the function execution fails. The
                      function will be retried up to 5 times, then marked as
                      failed if it doesn't run successfully.
                    </p>
                  </div>
                  <Switch
                    checked={field.state.value}
                    onCheckedChange={field.handleChange}
                  />
                </div>
              )}
            </form.Field>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => ({
                isSubmitting: state.isSubmitting,
                name: state.values.name,
                selectedChainId: state.values.selectedChainId,
                selectedProfileId: state.values.selectedProfileId,
                triggerType: state.values.triggerType,
                singleRunDate: state.values.singleRunDate,
                singleRunTime: state.values.singleRunTime,
                cronSchedule: state.values.cronSchedule,
              })}
            >
              {({
                isSubmitting,
                name,
                selectedChainId,
                selectedProfileId,
                triggerType,
                singleRunDate,
                singleRunTime,
                cronSchedule,
              }) => (
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !name ||
                    !name.trim() ||
                    !selectedChainId ||
                    !selectedProfileId ||
                    (triggerType === 'single' &&
                      (!singleRunDate || !singleRunTime)) ||
                    (triggerType === 'cron' &&
                      (!cronSchedule || !cronSchedule.trim()))
                  }
                >
                  {isSubmitting ? 'Creating...' : 'Create Executable'}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
