import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#101018" }}>
      {/* Left panel — form */}
      <div
        className="flex w-full lg:w-2/5 flex-col justify-center px-8 py-12 sm:px-12"
        style={{ backgroundColor: "#0d0d16", borderRight: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8">
            <Image src="/logo.png" alt="NightGuard" width={140} height={40} className="object-contain" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
