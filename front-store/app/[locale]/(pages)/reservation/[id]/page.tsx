import { getReservation } from "@/actions/reservation";
import Breadcrumbs from "@/components/custom/Breadcrumbs";
import Container from "@/components/custom/Container";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type ReservationPageProps = {
  params: {
    id: string;
  };
};

const formatExpiration = (value?: string) => {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(value));
};

export default async function Page({ params }: ReservationPageProps) {
  const reservation = await getReservation(params.id);

  if (!reservation?.id) {
    notFound();
  }

  const vendorName = reservation.vendor?.displayName || "Assigned vendor";

  return (
    <>
      <Breadcrumbs page="Reservation" />

      <section className="py-12">
        <Container>
          <div className="mx-auto flex max-w-3xl flex-col gap-8 border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
                Reservation confirmed
              </p>
              <h1 className="text-3xl font-bold text-gray-900">
                Pickup code: {reservation.pickupCode}
              </h1>
              <p className="text-base text-gray-600">
                Your items are reserved for pickup until{" "}
                <span className="font-semibold text-gray-900">
                  {formatExpiration(reservation.expiresAt)}
                </span>
                .
              </p>
            </div>

            <div className="grid gap-4 border border-gray-100 bg-gray-50 p-6 md:grid-cols-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-[0.18em] text-gray-500">
                  Reservation
                </span>
                <span className="text-lg font-semibold text-gray-900">
                  {reservation.reservationNumber}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-[0.18em] text-gray-500">
                  Status
                </span>
                <span className="text-lg font-semibold text-gray-900">
                  {reservation.status}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-[0.18em] text-gray-500">
                  Vendor
                </span>
                <span className="text-lg font-semibold text-gray-900">
                  {vendorName}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-[0.18em] text-gray-500">
                  Expires
                </span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatExpiration(reservation.expiresAt)}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              Keep this pickup code handy. {vendorName} will use it to confirm
              your reservation at collection time.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}

export const metadata: Metadata = {
  title: "Reservation - E-City - Ecommerce",
  description: "Reservation confirmation and pickup details.",
  icons: {
    icon: "/assets/images/logo.png",
  },
};
