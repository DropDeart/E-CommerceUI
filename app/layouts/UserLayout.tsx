import { ReactNode } from "react";

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <div className="user-layout">
      <main>{children}</main>
    </div>
  );
}
