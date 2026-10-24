// Interim text wordmark. When the client has a real logo, change ONLY this file.
// (Your old BrandLogo is safe in git history; back it up before replacing.)
export default function BrandLogo() {
  return (
    <span className="flex items-baseline gap-1.5 font-serif text-[1.4rem] leading-none tracking-tight text-ink">
      <span className="font-semibold">KRL</span>
      <span className="font-normal text-ink/70">Academy</span>
    </span>
  );
}
