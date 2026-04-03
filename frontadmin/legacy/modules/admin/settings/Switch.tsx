"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";
import Alert from "@/components/custom/Alert";

import useSWRMutation from "swr/mutation";
import { SwitchRequestArgs } from "@/types/mutations";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function Switch({ check }: { check: boolean }) {
  // 1. Hooks
  const [openAlert, setOpenAlert] = useState<boolean>(false);
  const { getToken } = useAuth();
  const { userId } = useAuth();
  const router = useRouter();

  async function switchRequest(
    url: string,
    { arg }: { arg: SwitchRequestArgs }
  ) {
    const token = await getToken();

    return await axios
      .put(url, arg.queryParams, {
        params: { userId: arg.queryParams.userId },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const data = response.data;
        toast({
          variant: "default",
          title: "Well done ✔️",
          description: data.message,
        });
      })
      .catch((err) => {
        console.log(err.message);
      })
      .finally(() => {
        router.push("/stores");
      });
  }

  const { trigger: SwitchAccount, isMutating: isSwitching } = useSWRMutation(
    process.env.NEXT_PUBLIC_API_URL + "/api/user/users",
    switchRequest /* options */
  );

  // Define a submit handler.
  const onSwitchToAdmin = async () => {
    await SwitchAccount({
      queryParams: {
        userId: userId ? userId : "",
        role: check ? "user" : "admin",
      },
    });
  };

  return (
    <div className="grid grid-cols-1 grid-rows-2 gap-4">
      <Card className="min-w-[360px] flex justify-between items-center">
        <CardHeader className="!h-fit">
          <CardTitle>Switch my account</CardTitle>
          <CardDescription className="text-red-600">
            Make sure to sign out and sign in again to see effect.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid place-content-center">
          <Button
            disabled={isSwitching}
            variant="default"
            size="icon"
            onClick={() => setOpenAlert(!openAlert)}
          >
            <Shuffle className="text-white" />
          </Button>
        </CardContent>
      </Card>

      <Alert
        openAlert={openAlert}
        setOpenAlert={setOpenAlert}
        onConfirm={onSwitchToAdmin}
        isDeleting={isSwitching}
      />
    </div>
  );
}
