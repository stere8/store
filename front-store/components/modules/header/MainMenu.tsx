import React from "react";
import Container from "@/components/custom/Container";
import Logo from "@/components/custom/Logo";
import SearchInput from "./SearchInput";
import IconsGroup from "./IconsGroup";
import MobileSocialMenu from "./MobileSocialMenu";
// import MobileSearchInput from "./MobileSearchInput";
import SidebarMenu from "./SidebarMenu";

export default function MainMenu() {
  return (
    <nav className="bg-secondary-700 h-[88px] border-t-[1px] border-white border-opacity-20 ">
      <Container>
        <div className="flex justify-between items-center h-full">
          <SidebarMenu className="block lg:hidden" />
          <Logo />
          <SearchInput className="hidden lg:flex flex-1 justify-center items-center bg-white max-w-[646px] gap-4 px-2 h-[48px] " />
          <IconsGroup className="hidden w-fit lg:inline-flex  items-center relative " />
          <div className="inline-flex gap-4 lg:hidden">
            {/* <MobileSearchInput className=" text-white" /> */}
            <MobileSocialMenu className=" text-white" />
          </div>
        </div>
      </Container>
    </nav>
  );
}
