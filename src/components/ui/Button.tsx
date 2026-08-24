import React from "react";

export default function Button({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button onClick={onClick} style={{ padding: 8, borderRadius: 6 }}>
      {children}
    </button>
  );
}
