import { useForm } from '@tanstack/react-form';
import { Link } from '@tanstack/react-router';
import { useAction } from 'convex/react';
import { Mail, Phone, User } from 'lucide-react';
import { useId, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { api } from '@/../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const supportFormSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .trim()
    .min(1, 'First name cannot be empty'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .trim()
    .min(1, 'Last name cannot be empty'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .refine(
      (value) => {
        // Remove all non-digit characters for validation
        const digitsOnly = value.replace(/\D/g, '');
        // Check if we have at least 10 digits (minimum for a valid phone number)
        // and at most 15 digits (E.164 international format max)
        return digitsOnly.length >= 10 && digitsOnly.length <= 15;
      },
      {
        message:
          'Please enter a valid phone number (10-15 digits, with or without formatting)',
      },
    ),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  message: z
    .string()
    .min(1, 'Message is required')
    .trim()
    .min(1, 'Message cannot be empty'),
  agreedToPrivacy: z.boolean().refine((value) => value === true, {
    message: 'You must agree to the privacy policy',
  }),
});

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sendSupportEmail = useAction(api.action.email.sendSupportEmailAction);
  const firstNameId = useId();
  const lastNameId = useId();
  const phoneId = useId();
  const emailId = useId();
  const messageId = useId();
  const privacyId = useId();

  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      message: '',
      agreedToPrivacy: false,
    },
    onSubmit: async ({ value }) => {
      if (!value.agreedToPrivacy) {
        toast.error('Please agree to the privacy policy');
        return;
      }

      setIsSubmitting(true);

      try {
        await sendSupportEmail({
          firstName: value.firstName,
          lastName: value.lastName,
          email: value.email,
          phone: value.phone,
          message: value.message,
        });

        toast.success(
          "Your message has been sent! We'll get back to you soon.",
        );
        form.reset();
      } catch (error) {
        console.error('Failed to send support email:', error);
        toast.error('Failed to send your message. Please try again later.');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid items-start gap-16 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-foreground text-3xl leading-tight font-bold lg:text-4xl">
                Need Help With
                <br />
                Your Web3 Automation?
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                Whether you&#39;re building your first Web3 function, scaling
                your automation, or need technical guidance—our team is here to
                help you succeed.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-6"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <form.Field
                  name="firstName"
                  validators={{
                    onChange: ({ value }) => {
                      const result =
                        supportFormSchema.shape.firstName.safeParse(value);
                      return result.success
                        ? undefined
                        : result.error.issues[0]?.message;
                    },
                  }}
                >
                  {(field) => (
                    <div className="relative">
                      <User className="text-muted-foreground absolute top-3 left-3 h-5 w-5" />
                      <Input
                        id={firstNameId}
                        placeholder="First Name"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className="border-border bg-card h-12 pl-10"
                      />
                      {field.state.meta.errors && (
                        <p className="text-sm text-destructive mt-1">
                          {field.state.meta.errors[0]}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                <form.Field
                  name="lastName"
                  validators={{
                    onChange: ({ value }) => {
                      const result =
                        supportFormSchema.shape.lastName.safeParse(value);
                      return result.success
                        ? undefined
                        : result.error.issues[0]?.message;
                    },
                  }}
                >
                  {(field) => (
                    <div className="relative">
                      <User className="text-muted-foreground absolute top-3 left-3 h-5 w-5" />
                      <Input
                        id={lastNameId}
                        placeholder="Last Name"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className="border-border bg-card h-12 pl-10"
                      />
                      {field.state.meta.errors && (
                        <p className="text-sm text-destructive mt-1">
                          {field.state.meta.errors[0]}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>
              </div>

              <form.Field
                name="phone"
                validators={{
                  onChange: ({ value }) => {
                    const result =
                      supportFormSchema.shape.phone.safeParse(value);
                    return result.success
                      ? undefined
                      : result.error.issues[0]?.message;
                  },
                }}
              >
                {(field) => (
                  <div className="relative">
                    <Phone className="text-muted-foreground absolute top-3 left-3 h-5 w-5" />
                    <Input
                      id={phoneId}
                      placeholder="Phone No"
                      type="tel"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="border-border bg-card h-12 pl-10"
                    />
                    {field.state.meta.errors && (
                      <p className="text-sm text-destructive mt-1">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field
                name="email"
                validators={{
                  onChange: ({ value }) => {
                    const result =
                      supportFormSchema.shape.email.safeParse(value);
                    return result.success
                      ? undefined
                      : result.error.issues[0]?.message;
                  },
                }}
              >
                {(field) => (
                  <div className="relative">
                    <Mail className="text-muted-foreground absolute top-3 left-3 h-5 w-5" />
                    <Input
                      id={emailId}
                      placeholder="Email"
                      type="email"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="border-border bg-card h-12 pl-10"
                    />
                    {field.state.meta.errors && (
                      <p className="text-sm text-destructive mt-1">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field
                name="message"
                validators={{
                  onChange: ({ value }) => {
                    const result =
                      supportFormSchema.shape.message.safeParse(value);
                    return result.success
                      ? undefined
                      : result.error.issues[0]?.message;
                  },
                }}
              >
                {(field) => (
                  <div>
                    <Textarea
                      id={messageId}
                      placeholder="Tell us about your Web3 automation needs, questions, or how we can help..."
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="border-border bg-card min-h-32 resize-none"
                    />
                    {field.state.meta.errors && (
                      <p className="text-sm text-destructive mt-1">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field
                name="agreedToPrivacy"
                validators={{
                  onChange: ({ value }) => {
                    const result =
                      supportFormSchema.shape.agreedToPrivacy.safeParse(value);
                    return result.success
                      ? undefined
                      : result.error.issues[0]?.message;
                  },
                }}
              >
                {(field) => (
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={privacyId}
                      checked={field.state.value}
                      onCheckedChange={(checked) =>
                        field.handleChange(checked === true)
                      }
                      onBlur={field.handleBlur}
                    />
                    <label
                      htmlFor={privacyId}
                      className="text-muted-foreground text-sm leading-relaxed"
                    >
                      I have read and agree to the{' '}
                      <Link to="/privacy-policy" className="underline">
                        privacy policy
                      </Link>
                    </label>
                    {field.state.meta.errors && (
                      <p className="text-sm text-destructive mt-1">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting || !form.state.canSubmit}
              >
                {isSubmitting ? 'Sending...' : 'Send Your Message'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
