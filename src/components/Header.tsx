"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import Login from "@/components/Login";
import { useSession } from "next-auth/react";
import { useRequesters } from "@/scripts/requests";
import Link from "next/link";
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

import bear_vector from "@/assets/images/header/logo.svg";

function NavButton(props: { item: any }) {
  const pathname = usePathname();
  const isDropdown = props.item.dropdown.length > 0;

  return (
    <div className="relative group">
      <Link
        href={props.item.url}
        className={`block py-2 px-4 rounded-lg
        ${isDropdown ? "group-hover:rounded-b-none" : ""}
          cursor-pointer font-montserrat font-bold text-[13pt]
          group-hover:bg-boc_green group-hover:text-white
      ${pathname.includes(props.item.url) ? "bg-boc_green text-white" : "bg-transparent text-boc_darkbrown"}`}
      >
        {props.item.label}
      </Link>

      {isDropdown ? (
        <ul
          className="absolute top-full w-full bg-background text-[12pt]
      text-boc_darkbrown rounded-b-md opacity-0 invisible border-[2px] border-boc_green
      group-hover:visible group-hover:opacity-100 z-10"
        >
          {props.item.dropdown.map((option: any, i: any) => (
            <li
              key={option.url}
              className={`border-b-transparent rounded-b-[5px]
              ${i > 0 ? "border-boc_darkgreen border-t-[2px]" : ""}`}
            >
              <Link
                href={option.url}
                className="block px-2 py-2 cursor-pointer hover:bg-green-100 text-center rounded-b-[5px]"
              >
                {option.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

//One row of the mobile menu. Items with children toggle an accordion rather than navigating -
//no link is lost, since "About Us" and "Gear Room" are the first child of their own list.
function MobileNavItem(props: {
  item: any;
  expanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  const { item, expanded, onToggle, onNavigate } = props;
  const pathname = usePathname();
  const rowStyle = `w-full flex justify-between items-center px-6 py-4 text-left
    font-montserrat font-bold text-[13pt]
    ${pathname.includes(item.url) ? "text-boc_green" : "text-boc_darkbrown"}`;

  if (item.dropdown.length === 0) {
    return (
      <Link href={item.url} onClick={onNavigate} className={rowStyle}>
        {item.label}
      </Link>
    );
  }
  return (
    <>
      <button type="button" onClick={onToggle} aria-expanded={expanded} className={rowStyle}>
        {item.label}
        <ChevronDownIcon
          className={`w-5 h-5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      {expanded ? (
        <ul className="bg-boc_lightbrown">
          {item.dropdown.map((option: any) => (
            <li key={option.url}>
              <Link
                href={option.url}
                onClick={onNavigate}
                className="block px-10 py-3 text-boc_darkbrown"
              >
                {option.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

//The panel that pushes the page down when the hamburger is open
function MobileMenu(props: { items: any[]; showLogin: boolean; onNavigate: () => void }) {
  const { items, showLogin, onNavigate } = props;
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div
      id="mobile-menu"
      className="desktop:hidden border-t-2 border-boc_green bg-background"
    >
      <ul className="divide-y-2 divide-boc_lightbrown">
        {items.map((item) => (
          <li key={item.url}>
            <MobileNavItem
              item={item}
              expanded={expanded === item.url}
              onToggle={() => setExpanded((cur) => (cur === item.url ? null : item.url))}
              onNavigate={onNavigate}
            />
          </li>
        ))}
        {showLogin ? (
          <li>
            <Login>
              <div className="px-6 py-4 font-montserrat font-bold text-[13pt] text-boc_darkbrown">
                LOGIN
              </div>
            </Login>
          </li>
        ) : null}
      </ul>
    </div>
  );
}

function NavBar() {
  const [user, setUser] = useState("");
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const { status } = useSession();
  const { backendGet } = useRequesters();
  const pathname = usePathname();

  //Links close the menu themselves, but this also catches browser back/forward
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const menuItems = [
    {
      label: "ABOUT US",
      url: "/about",
      dropdown: [
        { label: "About Us", url: "/about" },
        { label: "Land Tribute", url: "/about/land-tribute" },
        { label: "Financial Aid", url: "/about/financial-aid" },
        { label: "Our Team", url: "/about/our-team" },
        //{ label: "Photo Album", url: "/about/photo-album" }, - We just gonna pretend that doesn't exist
      ],
    },
    {
      label: "TRIPS",
      url: "/trips",
      dropdown: [],
    },
    {
      label: "GET INVOLVED",
      url: "/get-involved",
      dropdown: [],
    },
    {
      label: "GEAR ROOM",
      url: "/gear-room",
      dropdown: [
        { label: "Gear Room", url: "/gear-room" },
        { label: "Policies", url: "/gear-room/policies" },
      ],
    },
  ];

  const userItem = {
    label: user,
    url: "/user",
    dropdown: [
      { label: "Profile", url: "/user" },
      { label: "Logout", url: "/logout" },
    ],
  };

  const updateLogin = async () => {
    try {
      const { data: userData } = await backendGet("/user/profile");
      setUser(`${userData.firstName} ${userData.lastName}`);
    } catch (_error) {
      setUser(""); //Includes the ordinary signed-out case, which rejects with a 401
    }
    setLoading(false);
  };

  useEffect(() => {
    if (status !== "loading") {
      updateLogin();
    }
  }, [status]);

  return (
    <header>
      <nav className="px-6 py-5 desktop:px-8 desktop:py-8 flex justify-between items-center">
        <Link href="/">
          <img
            src={bear_vector.src}
            alt="Brown Outing Club home"
            className="cursor-pointer"
          />
        </Link>
        <div className="hidden desktop:flex space-x-[37px] px-10 py-4">
          {menuItems.map((item) => (
            <NavButton key={item.url} item={item} />
          ))}

          {loading ? (
            <div className="w-[200px]"></div>
          ) : (
            <div className="flex font-bold font-montserrat text-boc_darkbrown justify-end w-[200px]">
              {user ? (
                <NavButton item={userItem} />
              ) : (
                <Login>
                  <div className="h-full flex items-center">LOGIN</div>
                </Login>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          className="desktop:hidden p-2 -mr-2 text-boc_darkbrown"
        >
          {menuOpen ? (
            <XMarkIcon className="w-8 h-8" />
          ) : (
            <Bars3Icon className="w-8 h-8" />
          )}
        </button>
      </nav>

      {menuOpen ? (
        <MobileMenu
          items={user ? [...menuItems, userItem] : menuItems}
          showLogin={!loading && !user}
          onNavigate={() => setMenuOpen(false)}
        />
      ) : null}
    </header>
  );
}

export default NavBar; // Make sure to export the component
