"use client";
import { Button, Navbar, Avatar, DarkThemeToggle } from "flowbite-react";
import Link from "next/link";
import { HiHome, HiCurrencyDollar } from "react-icons/hi";
export const NavbarComponent = () => {
  return (
    <Navbar
      fluid
      className="bg-white dark:bg-gray-900 backdrop-blur-md border-b border-cyan-500/20">
      <Navbar.Brand
        as={Link}
        href="/">
        <img
          src="/logo-light.svg"
          className="mr-3 h-6 sm:h-8"
          alt="EmailGuard Logo"
        />
        <span className="self-center whitespace-nowrap text-xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 text-transparent bg-clip-text">
          EmailGuard
        </span>
      </Navbar.Brand>

      <div className="flex md:order-2 items-center gap-4">
        <DarkThemeToggle className="focus:ring-cyan-500" />
        <Link href="/profile">
          <Avatar
            img="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
            rounded
            status="online"
            statusPosition="bottom-right"
            className="cursor-pointer"
          />
        </Link>
        <Navbar.Toggle />
      </div>

      <Navbar.Collapse>
        <Link
          href="/home"
          className="flex items-center gap-2 text-black dark:bg-[#0a0a0a] dark:text-white hover:text-cyan-500 dark:hover:text-cyan-500">
          <HiHome className="w-5 h-5" />
          Home
        </Link>
        <Link
          href="/pricing"
          className="flex items-center gap-2 text-black dark:bg-[#0a0a0a] dark:text-white hover:text-cyan-500 dark:hover:text-cyan-500">
          <HiCurrencyDollar className="w-5 h-5" />
          Pricing
        </Link>
      </Navbar.Collapse>
    </Navbar>
  );
};
