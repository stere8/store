"use client";

import { SignIn, SignUp, useAuth, useUser } from "@clerk/nextjs";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Loading from "@/components/custom/Loading";
import {
  buildAuthRedirectUrl,
  normalizeInternalReturnPath,
  readAuthResumeState,
  upsertCustomerFromUser,
} from "@/lib/customer-auth";

type CustomerAuthPageProps = {
  mode: "sign-in" | "sign-up";
};

export default function CustomerAuthPage({ mode }: CustomerAuthPageProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const handledRedirectRef = useRef(false);
  const [syncingCustomer, setSyncingCustomer] = useState(false);

  const returnPath = useMemo(() => {
    const storedState = readAuthResumeState();
    return normalizeInternalReturnPath(
      searchParams.get("return_url"),
      storedState?.returnPath || "/cart"
    );
  }, [searchParams]);

  const callbackUrl = useMemo(
    () =>
      `${pathname}?post_auth=1&return_url=${encodeURIComponent(returnPath)}`,
    [pathname, returnPath]
  );

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || handledRedirectRef.current) {
      return;
    }

    handledRedirectRef.current = true;

    const finishAuthentication = async () => {
      setSyncingCustomer(true);

      try {
        await upsertCustomerFromUser(user);
      } catch (error) {
        console.error("Error creating customer from Clerk user", error);
      } finally {
        router.replace(returnPath);
      }
    };

    void finishAuthentication();
  }, [isLoaded, isSignedIn, returnPath, router, user]);

  if ((isLoaded && isSignedIn) || syncingCustomer) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loading loading={true} />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-20">
      {mode === "sign-in" ? (
        <SignIn
          appearance={{}}
          forceRedirectUrl={callbackUrl}
          fallbackRedirectUrl={callbackUrl}
          signUpUrl={buildAuthRedirectUrl("/sign-up", returnPath)}
        />
      ) : (
        <SignUp
          forceRedirectUrl={callbackUrl}
          fallbackRedirectUrl={callbackUrl}
          signInUrl={buildAuthRedirectUrl("/sign-in", returnPath)}
        />
      )}
    </div>
  );
}
