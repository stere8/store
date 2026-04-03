"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Cart } from "@/types";
import Container from "@/components/custom/Container";
import { Input } from "@/components/custom/Input";
import { Textarea } from "@/components/ui/textarea";
import { RectangleButton } from "@/components/custom/RectangleButton";
import CurrencyFormat from "@/components/custom/CurrencyFormat";
import { apiClient } from "@/lib/epoc-api";
import Loading from "@/components/custom/Loading";
import { toast } from "@/hooks/use-toast";
import { useUser } from "@clerk/nextjs";

type ReservationResponse = {
  id: string;
  reservationNumber: string;
  pickupCode: string;
  totalAmount: number;
  status: string;
  expiresAt?: string;
};

export default function CartReservation({ cart }: { cart: Cart }) {
  const { user } = useUser();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [reservation, setReservation] = useState<ReservationResponse | null>(
    null
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    setCustomerName(user.fullName || user.firstName || "");
    setCustomerEmail(user.primaryEmailAddress?.emailAddress || "");
    setCustomerPhone((current) =>
      current || `+250${user.id.replace(/\D/g, "").slice(0, 9).padEnd(9, "0")}`
    );
  }, [user]);

  const vendorIds = useMemo(
    () =>
      Array.from(
        new Set(
          cart.cartItems
            .map((item) =>
              typeof item.store === "string" ? item.store : item.store?._id
            )
            .filter(Boolean)
        )
      ),
    [cart.cartItems]
  );

  const canReserve = cart.cartItems.length > 0 && vendorIds.length === 1;

  const submitReservation = async () => {
    if (!canReserve) {
      toast({
        variant: "destructive",
        title: "Reservation unavailable",
        description:
          vendorIds.length > 1
            ? "The current API supports one vendor per reservation. Please reserve items from one seller at a time."
            : "Your cart is empty.",
      });
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Customer name and phone number are required.",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post("/api/reservations", {
        vendorId: vendorIds[0],
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || null,
        customerNote: customerNote.trim() || null,
        preferredLanguage: "en",
        items: cart.cartItems.map((item) => ({
          productId: item.variant._id,
          quantity: item.qty,
        })),
      });

      setReservation(response.data);
      toast({
        variant: "default",
        title: "Reservation created",
        description: "Your items are now reserved for pickup.",
      });
    } catch (error) {
      console.error("Reservation creation failed", error);
      toast({
        variant: "destructive",
        title: "Reservation failed",
        description:
          "The .NET API could not create the reservation. Check vendor and stock data in the local database.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="my-10">
      {loading && <Loading loading={true} />}
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8">
          <div className="border border-gray-100 p-6 flex flex-col gap-6">
            <div>
              <h3 className="font-bold text-xl">Reserve your cart</h3>
              <p className="text-sm text-gray-600 mt-2">
                This storefront now checks out through the reservation workflow
                exposed by the .NET API.
              </p>
            </div>

            {!canReserve && (
              <div className="rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                {vendorIds.length > 1
                  ? "Your cart contains items from multiple vendors. The current API allows one vendor per reservation, so split the cart before continuing."
                  : "No reservable cart items were found."}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Customer name"
              />
              <Input
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
                placeholder="Phone number"
              />
              <Input
                value={customerEmail}
                onChange={(event) => setCustomerEmail(event.target.value)}
                placeholder="Email address"
                className="md:col-span-2"
              />
            </div>

            <Textarea
              value={customerNote}
              onChange={(event) => setCustomerNote(event.target.value)}
              placeholder="Add a pickup note (optional)"
              rows={4}
            />

            <RectangleButton
              variant="primary"
              icon="none"
              size="lg"
              onClick={submitReservation}
              disabled={!canReserve || loading}
              className="rounded-none"
            >
              Create reservation
            </RectangleButton>
          </div>

          <div className="border border-gray-100 p-6 flex flex-col gap-4 h-fit">
            <h3 className="font-bold text-xl">Cart summary</h3>
            {cart.cartItems.map((item) => (
              <div
                key={item._id || item.variant._id}
                className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{item.productName}</span>
                  <span className="text-sm text-gray-500">
                    Qty {item.qty}
                  </span>
                </div>
                <CurrencyFormat value={item.variant.price * item.qty} />
              </div>
            ))}

            <div className="flex justify-between pt-2">
              <strong>Total</strong>
              <strong>
                <CurrencyFormat value={cart.total || cart.subTotal} />
              </strong>
            </div>

            {reservation && (
              <div className="mt-4 rounded border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950 flex flex-col gap-2">
                <strong>Reservation confirmed</strong>
                <span>Number: {reservation.reservationNumber}</span>
                <span>Pickup code: {reservation.pickupCode}</span>
                <span>Status: {reservation.status}</span>
                {reservation.expiresAt && (
                  <span>
                    Expires: {new Date(reservation.expiresAt).toLocaleString()}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
