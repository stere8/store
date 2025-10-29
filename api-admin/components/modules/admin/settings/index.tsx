"use client";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Informations from "./Informations";

export default function Settings({ check }: { check: boolean }) {
  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <Heading name="Settings" description="Customize your store" />
          <Separator />
        </div>

        <Tabs defaultValue="account" className="w-full">
          <TabsList>
            <TabsTrigger value="account">Informations</TabsTrigger>
          </TabsList>
          <TabsContent
            value="account"
            className="w-full grid grid-cols-1  lg:grid-cols-4 gap-4"
          >
            {<Informations check={check} />}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
