"use client";

import { useActionState } from "react";
import { submitSellerPriceAction } from "@/lib/actions/sellers";
import { emptyActionState } from "@/lib/actions/types";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function PriceForm({
  products,
  lockedProduct,
  currency,
  defaultPrice,
  defaultAvailability,
  defaultNotes,
}: {
  products?: { id: string; name: string; unit: string }[];
  lockedProduct?: { id: string; name: string; unit: string };
  currency: string;
  defaultPrice?: number;
  defaultAvailability?: "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";
  defaultNotes?: string;
}) {
  const [state, formAction] = useActionState(submitSellerPriceAction, emptyActionState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      {lockedProduct ? (
        <Field label="Product" htmlFor="productDisplay">
          <input type="hidden" name="productId" value={lockedProduct.id} />
          <div
            id="productDisplay"
            className="w-full rounded-lg border border-border bg-mist px-3.5 py-2.5 text-sm text-ink-900"
          >
            {lockedProduct.name} ({lockedProduct.unit})
          </div>
        </Field>
      ) : (
        <Field label="Product" htmlFor="productId" error={state.fieldErrors?.productId}>
          <Select id="productId" name="productId" defaultValue="" required>
            <option value="" disabled>
              Choose a product
            </option>
            {products?.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.unit})
              </option>
            ))}
          </Select>
        </Field>
      )}

      <Field label={`Price (${currency})`} htmlFor="price" error={state.fieldErrors?.price}>
        <Input
          id="price"
          name="price"
          type="number"
          step="0.01"
          min="0.01"
          defaultValue={defaultPrice}
          required
        />
      </Field>

      <Field label="Availability" htmlFor="availability">
        <Select id="availability" name="availability" defaultValue={defaultAvailability ?? "IN_STOCK"}>
          <option value="IN_STOCK">In stock</option>
          <option value="OUT_OF_STOCK">Out of stock</option>
          <option value="UNKNOWN">Not sure</option>
        </Select>
      </Field>

      <Field label="Notes (optional)" htmlFor="notes" error={state.fieldErrors?.notes}>
        <Textarea id="notes" name="notes" rows={2} defaultValue={defaultNotes} />
      </Field>

      <SubmitButton pendingLabel="Saving…">Save price</SubmitButton>
    </form>
  );
}
