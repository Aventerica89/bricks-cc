"use client";

import { usePathname } from "next/navigation";
import NavBar from "./nav-bar";

const HIDE_NAV_EXACT = ["/", "/auth/pin"];
const HIDE_NAV_PREFIX = ["/dashboard"];

export default function NavBarWrapper() {
  const pathname = usePathname();
  const shouldHide =
    HIDE_NAV_EXACT.includes(pathname) ||
    HIDE_NAV_PREFIX.some((prefix) => pathname.startsWith(prefix));

  if (shouldHide) return null;

  return <NavBar />;
}
