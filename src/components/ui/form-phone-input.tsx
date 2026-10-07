import { forwardRef, type ComponentProps } from "react";
import PhoneInput, { type PhoneInputProps } from "react-phone-input-2";

type Props = PhoneInputProps & Pick<ComponentProps<"input">,
  "id" | "name" | "aria-invalid" | "aria-describedby">;

// Form libraries must receive the native input, not PhoneInput's component instance.
export const FormPhoneInput = forwardRef<HTMLInputElement, Props>(function FormPhoneInput(
  { id, name, "aria-invalid": invalid, "aria-describedby": describedBy, inputProps, ...props }, ref,
) {
  return <PhoneInput {...props} inputProps={{ ...inputProps, id, name, "aria-invalid": invalid, "aria-describedby": describedBy, ref }} />;
});
