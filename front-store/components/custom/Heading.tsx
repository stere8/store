import React from "react";
import { FormattedMessage } from "react-intl";

export default function Heading({ name }: { name: string }) {
  return <h1 className="text-black text-center">  <FormattedMessage id={`${name}`} />  </h1>;
}
