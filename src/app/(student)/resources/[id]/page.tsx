import React from "react";

type Props = { params: { id: string } };

export default function ResourcePage({ params }: Props) {
  return (
    <article>
      <h1>Resource {params.id}</h1>
      <p>Resource details go here.</p>
    </article>
  );
}
