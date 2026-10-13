import { ShieldCheck, Truck } from "lucide-react";

export const portalInputClass = "h-10 rounded-[12px] bg-white pl-11 pr-4 border-[#36454f]/25 text-[#333333] placeholder:text-[#333333]/60 focus-visible:border-[#7965ed] focus-visible:ring-[#7965ed]/25";
export const portalIconClass = "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#36454f]";
export const portalButtonClass = "flex w-full h-10 rounded-[12px] bg-gradient-to-r from-[#6965ed] to-[#a24ed0] hover:brightness-105 text-white text-xs tracking-wide font-medium shadow-[0_4px_10px_rgba(124,92,232,0.18)]";

export function PortalLoginCard({ kind, children }: { kind: "admin" | "delivery"; children: React.ReactNode }) {
  const Icon = kind === "admin" ? ShieldCheck : Truck;
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#e7ebf0] p-4">
      <div className="w-full max-w-[400px] rounded-[12px] bg-white p-5 sm:p-6 text-[#333333] shadow-[0_0_28px_rgba(16,12,8,0.14)] [@media(max-height:640px)]:p-4">
        <div aria-hidden="true" className="relative mx-auto mb-3 h-[72px] w-32 [@media(max-height:640px)]:mb-2 [@media(max-height:640px)]:h-14">
          <span className="absolute left-1 top-9 h-1.5 w-1.5 rounded-full bg-[#9387ff]" />
          <span className="absolute left-3 bottom-2 h-1 w-1 rounded-full bg-[#d4baff]" />
          <span className="absolute right-1 top-12 h-1.5 w-1.5 rounded-full bg-[#93d5ff]" />
          <span className="absolute right-3 bottom-1 h-2 w-2 rounded-full bg-[#c084fc]" />
          <div className="absolute left-1/2 top-1 -translate-x-1/2 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#8b8cff] via-[#7965ed] to-[#7548d2] shadow-[0_8px_18px_rgba(124,92,232,0.22)] [@media(max-height:640px)]:h-12 [@media(max-height:640px)]:w-12">
            <Icon className="h-8 w-8 text-white [@media(max-height:640px)]:h-6 [@media(max-height:640px)]:w-6" />
          </div>
        </div>
        <h1 className="text-center text-[26px] font-bold leading-tight text-[#2d383a]">{kind === "admin" ? "Admin Login" : "Delivery Login"}</h1>
        <p className="mb-5 mt-1 text-center text-xs text-[#333333]/60">{kind === "admin" ? "Welcome back to your admin account" : "Welcome back to your delivery account"}</p>
        {children}
      </div>
    </div>
  );
}
