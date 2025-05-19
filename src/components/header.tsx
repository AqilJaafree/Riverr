'use client';

import NavMenu from "./nav-menu";
import { ConnectButton } from "@suiet/wallet-kit";

interface SiteHeaderProps {
  showConnectWallet?: boolean;
}

const Header = ({ showConnectWallet = true }: SiteHeaderProps) => {
  return (
    <div className="flex justify-between items-center lg:px-[70px] px-4 py-6">
      <h1 className="text-2xl font-bold">Riverr</h1>
      <div className="flex items-center gap-4">
        <NavMenu />
        {showConnectWallet && (
        <ConnectButton />
        )}
      </div>
    </div>
  );
};

export default Header;
