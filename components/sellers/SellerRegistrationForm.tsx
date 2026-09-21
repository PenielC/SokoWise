"use client";

import { useActionState } from "react";
import { registerSellerAction } from "@/lib/actions/sellers";
import { emptyActionState } from "@/lib/actions/types";
import { sellerTypes, SELLER_TYPE_LABEL } from "@/lib/validation/priceReport";
import { countries, COUNTRY_LABEL } from "@/lib/validation/country";
import { Field, Input, Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function SellerRegistrationForm() {
  const [state, formAction] = useActionState(registerSellerAction, emptyActionState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <Field label="Business or stall name" htmlFor="businessName" error={state.fieldErrors?.businessName}>
        <Input id="businessName" name="businessName" placeholder="e.g. Sunrise Supermarket" required />
      </Field>

      <Field label="Seller type" htmlFor="sellerType" error={state.fieldErrors?.sellerType}>
        <Select id="sellerType" name="sellerType" defaultValue="" required>
          <option value="" disabled>
            Choose a type
          </option>
          {sellerTypes.map((type) => (
            <option key={type} value={type}>
              {SELLER_TYPE_LABEL[type]}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Country" htmlFor="country" error={state.fieldErrors?.country}>
        <Select id="country" name="country" defaultValue="ZIMBABWE" required>
          {countries.map((code) => (
            <option key={code} value={code}>
              {COUNTRY_LABEL[code]}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Location" htmlFor="location" error={state.fieldErrors?.location}>
        <Input id="location" name="location" placeholder="e.g. Avondale" required />
      </Field>

      <Field label="City" htmlFor="city" error={state.fieldErrors?.city}>
        <Input id="city" name="city" placeholder="e.g. Harare" defaultValue="Harare" required />
      </Field>

      <Field label="Contact phone (optional)" htmlFor="contactPhone" error={state.fieldErrors?.contactPhone}>
        <Input id="contactPhone" name="contactPhone" placeholder="+263 ..." />
      </Field>

      <Field
        label="WhatsApp number (optional)"
        htmlFor="contactWhatsapp"
        error={state.fieldErrors?.contactWhatsapp}
      >
        <Input id="contactWhatsapp" name="contactWhatsapp" placeholder="+263 ..." />
      </Field>

      <SubmitButton pendingLabel="Registering…">Register as a seller</SubmitButton>
    </form>
  );
}
