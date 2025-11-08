import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone } from "lucide-react";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const PhoneInput = ({ value, onChange }: PhoneInputProps) => {
  return (
    <div className="space-y-2 w-full">
      <Label htmlFor="phone" className="text-sm font-medium">
        Phone Number
      </Label>
      <div className="relative">
        <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="phone"
          type="tel"
          placeholder="Enter your phone number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 h-12"
        />
      </div>
    </div>
  );
};
