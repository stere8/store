"use client";

import Container from "@/components/custom/Container";
import { Input } from "@/components/custom/Input";
import { RectangleButton } from "@/components/custom/RectangleButton";
import React, { useState } from "react";
import z from "zod";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Loader2Icon } from "lucide-react";
import { FormattedMessage, useIntl } from "react-intl";

export default function Newsletters() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const intl = useIntl();

  const handleSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (loading) {
      return;
    }

    setLoading(true);

    const Email = z.object({
      email: z.string().email().min(5).max(40),
    });

    const validatedFields = Email.safeParse({ email });

    if (!validatedFields.success) {
      toast({
        variant: "default",
        title: "Invalid email",
        description: "Try again with a valid email address.",
      });
      setLoading(false);
      return;
    }

    try {
      // The legacy email endpoint is not exposed by the current .NET API.
      await new Promise((resolve) => setTimeout(resolve, 250));
      toast({
        variant: "default",
        title: "Newsletter unavailable",
        description:
          "Email subscriptions are not exposed by the current .NET API yet.",
      });
      setEmail("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-secondary-700 py-[72px]">
      <Container>
        <div className="w-full flex flex-col justify-center gap-4 items-center text-white">
          <div className="flex flex-col items-center gap-4 max-w-[660px]">
            <p className="text-white my-2 text-heading1 capitalize">
              <FormattedMessage id="home.main.subscribe-to-news" />
            </p>
            <p className="text-body-md-400 opacity-70 text-center">
              <FormattedMessage id="home.main.subscribe-desc" />
            </p>
          </div>

          <div className="flex items-center bg-white p-2 max-w-[560px]">
            <Input
              placeholder={intl.formatMessage({
                id: "home.main.subcribe-enter-mail",
              })}
              className="text-black border-none"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />
            <RectangleButton
              disabled={loading}
              size="sm"
              icon="after"
              onClick={handleSave}
            >
              <Loader2Icon
                className={cn(
                  "hidden mr-2 h-6 w-6 animate-spin",
                  loading && "block"
                )}
              />
              <span>
                <FormattedMessage id="home.main.subscribe" />
              </span>
            </RectangleButton>
          </div>
        </div>
      </Container>
    </section>
  );
}
