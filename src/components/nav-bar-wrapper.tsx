"use client";

import { usePathname } from "next/navigation";
import NavBar from "./nav-bar";

const HIDE_NAV_ROUTES = ["/", "/auth/pin"];

export default function NavBarWrapper() {
  const pathname = usePathname();
  const shouldHide = HIDE_NAV_ROUTES.includes(pathname);

  if (shouldHide) return null;

  return <NavBar />;
}
