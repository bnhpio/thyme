import { Link } from '@tanstack/react-router';
import { useAction } from 'convex/react';
import { Mail, Phone, User } from 'lucide-react';
import { useId, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    message: '',
    agreedToPrivacy: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sendSupportEmail = useAction(api.action.email.sendSupportEmailAction);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreedToPrivacy) {
      toast.error('Please agree to the privacy policy');
      return;
    }

    setIsSubmitting(true);

    try {
      await sendSupportEmail({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
      });

      toast.success("Your message has been sent! We'll get back to you soon.");

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        message: '',
        agreedToPrivacy: false,
      });
    } catch (error) {
      console.error('Failed to send support email:', error);
      toast.error('Failed to send your message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="relative">
                  <User className="text-muted-foreground absolute top-3 left-3 h-5 w-5" />
                  <Input
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className="border-border bg-card h-12 pl-10"
                    required
                  />
                </div>
                <div className="relative">
                  <User className="text-muted-foreground absolute top-3 left-3 h-5 w-5" />
                  <Input
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    className="border-border bg-card h-12 pl-10"
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <Phone className="text-muted-foreground absolute top-3 left-3 h-5 w-5" />
                <Input
                  placeholder="Phone No"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="border-border bg-card h-12 pl-10"
                  required
                />
              </div>

              <div className="relative">
                <Mail className="text-muted-foreground absolute top-3 left-3 h-5 w-5" />
                <Input
                  placeholder="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="border-border bg-card h-12 pl-10"
                  required
                />
              </div>

              <div>
                <Textarea
                  placeholder="Tell us about your Web3 automation needs, questions, or how we can help..."
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  className="border-border bg-card min-h-32 resize-none"
                  required
                />
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id={useId()}
                  checked={formData.agreedToPrivacy}
                  onCheckedChange={(checked) =>
                    handleChange('agreedToPrivacy', checked)
                  }
                />
                <label
                  htmlFor="privacy"
                  className="text-muted-foreground text-sm leading-relaxed"
                >
                  I have read and agree to the{' '}
                  <Link to="/privacy-policy" className="underline">
                    privacy policy
                  </Link>
                </label>
              </div>

              <Button type="submit" size="lg" disabled={isSubmitting}>
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
