import React from "react";

export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
      {children}
    </div>
  );
}
