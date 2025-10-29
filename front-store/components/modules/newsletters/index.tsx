"use client";

import Container from "@/components/custom/Container";
import { Input } from "@/components/custom/Input";
import { RectangleButton } from "@/components/custom/RectangleButton";
//import Image from "next/image";
import React, { useState } from "react";
import z from "zod";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
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
        title: "Humm! 😏",
        description: "Try again, it's not a valid email.",
      });
      setLoading(false);
      return;
    }

    try {
      const values = {
        subject: "Subscribe to newsletter",
        email,
        message: "I just subscribed to your newsletter",
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/public/sendemail`,
        values
      );

      toast({
        variant: "default",
        title: "Fine✔️",
        description: response.data.message,
      });
    } catch (err) {
      console.error(err);
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
              placeholder={intl.formatMessage({ id: "home.main.subcribe-enter-mail" })}
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

                      {/* Uncomment this section if you want to display brand logos
              <div className="flex flex-wrap justify-center gap-4 opacity-25">
                {["google", "amazon", "philips", "toshiba", "samsung"].map((brand) => (
                  <Image
                    key={brand}
                    src={`/assets/logo/${brand}.png`}
                    alt={`${brand} logo`}
                    width="72"
                    height="72"
                  />
                ))}
              </div> 
              */}
        </div>
      </Container>
    </section>
  );
}