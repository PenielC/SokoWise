"use client";

import { useActionState, useState } from "react";
import { submitPriceReportAction } from "@/lib/actions/priceReports";
import { emptyActionState } from "@/lib/actions/types";
import { sellerTypes, SELLER_TYPE_LABEL } from "@/lib/validation/priceReport";
import { countries, COUNTRY_LABEL, CURRENCY_BY_COUNTRY, type CountryCode } from "@/lib/validation/country";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Button } from "@/components/ui/Button";

export function ReportPriceForm({
  productId,
  sellers,
}: {
  productId: string;
  sellers: { id: string; businessName: string; location: string; country: CountryCode }[];
}) {
  const [state, formAction] = useActionState(submitPriceReportAction, emptyActionState);
  const [addingNewSeller, setAddingNewSeller] = useState(sellers.length === 0);
  const [selectedSellerId, setSelectedSellerId] = useState("");
  const [newSellerCountry, setNewSellerCountry] = useState<CountryCode>("ZIMBABWE");

  // A hint only — the server always resolves the real currency itself from
  // whichever seller the report actually ends up attached to, never from
  // this client-side guess.
  const currency = addingNewSeller
    ? CURRENCY_BY_COUNTRY[newSellerCountry]
    : CURRENCY_BY_COUNTRY[sellers.find((s) => s.id === selectedSellerId)?.country ?? "ZIMBABWE"];

  if (state.success) {
    return (
      <div className="rounded-xl bg-green-600/10 px-4 py-3 text-sm text-green-600">
        Thanks — your price report has been submitted and is now visible on the product page.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="productId" value={productId} />

      {state.error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      {!addingNewSeller ? (
        <Field label="Seller" htmlFor="sellerId" error={state.fieldErrors?.sellerId}>
          <Select
            id="sellerId"
            name="sellerId"
            required
            defaultValue=""
            onChange={(event) => setSelectedSellerId(event.target.value)}
          >
            <option value="" disabled>
              Choose a seller
            </option>
            {sellers.map((seller) => (
              <option key={seller.id} value={seller.id}>
                {seller.businessName} — {seller.location}
              </option>
            ))}
          </Select>
          <button
            type="button"
            onClick={() => setAddingNewSeller(true)}
            className="mt-1.5 text-xs font-medium text-green-600 hover:underline"
          >
            + This seller isn&apos;t listed
          </button>
        </Field>
      ) : (
        <div className="space-y-4 rounded-lg bg-mist p-3.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">New seller</p>
            {sellers.length > 0 ? (
              <button
                type="button"
                onClick={() => setAddingNewSeller(false)}
                className="text-xs font-medium text-green-600 hover:underline"
              >
                Choose existing instead
              </button>
            ) : null}
          </div>

          <Field label="Business or stall name" htmlFor="newSellerName" error={state.fieldErrors?.newSellerName}>
            <Input id="newSellerName" name="newSellerName" placeholder="e.g. Mbudzi Market Stall 12" />
          </Field>

          <Field label="Seller type" htmlFor="newSellerType" error={state.fieldErrors?.newSellerType}>
            <Select id="newSellerType" name="newSellerType" defaultValue="">
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

          <Field label="Country" htmlFor="newSellerCountry" error={state.fieldErrors?.newSellerCountry}>
            <Select
              id="newSellerCountry"
              name="newSellerCountry"
              defaultValue="ZIMBABWE"
              onChange={(event) => setNewSellerCountry(event.target.value as CountryCode)}
            >
              {countries.map((code) => (
                <option key={code} value={code}>
                  {COUNTRY_LABEL[code]}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Location" htmlFor="newSellerLocation" error={state.fieldErrors?.newSellerLocation}>
            <Input id="newSellerLocation" name="newSellerLocation" placeholder="e.g. Mbare, Harare" />
          </Field>
        </div>
      )}

      <Field label={`Price you saw (${currency})`} htmlFor="price" error={state.fieldErrors?.price}>
        <Input id="price" name="price" type="number" step="0.01" min="0.01" required />
      </Field>

      <Field label="Availability" htmlFor="availability">
        <Select id="availability" name="availability" defaultValue="UNKNOWN">
          <option value="UNKNOWN">Not sure</option>
          <option value="IN_STOCK">In stock</option>
          <option value="OUT_OF_STOCK">Out of stock</option>
        </Select>
      </Field>

      <Field label="Notes (optional)" htmlFor="notes" error={state.fieldErrors?.notes}>
        <Textarea id="notes" name="notes" rows={2} placeholder="Anything else worth mentioning?" />
      </Field>

      <SubmitButton pendingLabel="Submitting…">Submit price report</SubmitButton>
    </form>
  );
}

export function ReportPriceCancelLink({ productId }: { productId: string }) {
  return (
    <Button href={`/products/${productId}`} variant="ghost" className="w-full">
      Cancel
    </Button>
  );
}
