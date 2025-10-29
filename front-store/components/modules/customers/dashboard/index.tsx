import React from "react";
import LeftSidebar from "../LeftSidebar";
import MainContent from "./MainContent";
import Container from "@/components/custom/Container";

export default function Dashboard() {
  return (
    <section className="py-10">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-y-8 lg:gap-8 ">
          <LeftSidebar />
          <MainContent />
        </div>
      </Container>
    </section>
  );
}
