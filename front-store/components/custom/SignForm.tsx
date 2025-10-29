import React from "react";
import { SignIn } from "@clerk/nextjs";

export default function SignForm() {
  return (
    <div>
      <SignIn />
    </div>
  );
}
