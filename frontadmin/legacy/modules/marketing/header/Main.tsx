import Container from "@/components/custom/Container";
import Logo from "@/components/custom/Logo";
import Row from "@/components/custom/Row";
import React from "react";
import Nav from "./Nav";
import SocialMedia from "./SocialMedia";
import MobileNav from "./MobileNav";

export default function Main() {
  return (
    <div className="h-[80px]">
      <Container>
        <Row className="gap-32">
          <Logo />
          <MobileNav className="flex lg:hidden ms-auto" />
          <Nav className="hidden lg:flex" />
          <SocialMedia className="ms-auto hidden lg:flex" />
        </Row>
      </Container>
    </div>
  );
}
