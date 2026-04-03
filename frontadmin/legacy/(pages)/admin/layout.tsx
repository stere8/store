import Header from "@/components/modules/admin/header";
import { checkRole } from "@/lib/roles";
import FramerMotionProvider from "@/providers/FramerMotionProvider";
import { redirect } from "next/navigation";
import React from "react";

export const revalidate = 600;
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  if ((await checkRole("admin")) === false) {
    redirect("/stores");
  }
  return (
    <>
      <Header />
      <FramerMotionProvider>{children}</FramerMotionProvider>
    </>
  );
}
