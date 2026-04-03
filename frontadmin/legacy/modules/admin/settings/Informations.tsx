import React from "react";
import Switch from "./Switch";

export default function Informations({ check }: { check: boolean }) {
  return (
    <>
      <Switch check={check} />
    </>
  );
}
