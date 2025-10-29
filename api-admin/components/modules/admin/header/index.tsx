import Container from "@/components/custom/Container";
import Row from "@/components/custom/Row";
import React from "react";
import IconsGroups from "./IconsGroups";
import NavMenu from "./NavMenu";

export default function Header() {
  return (
    <header className="h-[80px] z-10 border-b border-border ">
      <Container>
        <Row className="gap-4 relative">
          <NavMenu/>
          <IconsGroups className="ms-auto" />
        </Row>
      </Container>
    </header>
  );
}
