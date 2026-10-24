import Image from "next/image";

function Screen({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-[#0b1c33]">
      <Image src={src} alt={alt} fill className="object-cover object-top" sizes="(min-width: 1024px) 36vw, 90vw" />
    </div>
  );
}

function Imac() {
  return (
    <figure className="flex w-full flex-col items-center">
      <div className="w-full rounded-t-[18px] bg-gradient-to-b from-[#f4f4f6] to-[#d8d8de] p-[10px] shadow-[0_30px_60px_rgba(0,0,0,0.12)]">
        <div className="overflow-hidden rounded-[6px] bg-black">
          <Screen src="/simulator/welcome.jpg" alt="AITC welcome screen on an iMac" />
        </div>
      </div>
      <div className="relative h-11 w-full rounded-b-[14px] bg-gradient-to-b from-[#ececef] to-[#c9c9cf]">
        <span className="absolute left-1/2 top-2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#8e8e93]" />
      </div>
      <div className="h-14 w-[18%] bg-gradient-to-b from-[#d0d0d6] to-[#b7b7be]" style={{ clipPath: "polygon(32% 0, 68% 0, 100% 100%, 0 100%)" }} />
      <div className="h-[7px] w-[42%] rounded-full bg-gradient-to-b from-[#e6e6ea] to-[#bdbdc3] shadow-sm" />
      <figcaption className="mt-6 text-[17px] text-ink">iMac</figcaption>
    </figure>
  );
}

function MacBook() {
  return (
    <figure className="flex w-full flex-col items-center">
      <div className="w-full rounded-t-[12px] bg-[#1d1d1f] p-[7px] pb-[6px] shadow-[0_24px_40px_rgba(0,0,0,0.12)]">
        <div className="overflow-hidden rounded-[3px]">
          <Screen src="/simulator/radar.png" alt="AITC radar on a MacBook" />
        </div>
      </div>
      <div className="relative h-[14px] w-full rounded-b-[10px] bg-gradient-to-b from-[#e7e7eb] to-[#b9b9c0] shadow-[0_10px_16px_rgba(0,0,0,0.08)]">
        <span className="absolute left-1/2 top-0 h-[5px] w-16 -translate-x-1/2 rounded-b-md bg-[#9a9aa1]" />
      </div>
      <figcaption className="mt-6 text-[17px] text-ink">MacBook</figcaption>
    </figure>
  );
}

function Ipad() {
  return (
    <figure className="flex w-full flex-col items-center">
      <div className="w-full rounded-[28px] bg-gradient-to-b from-[#ececef] to-[#cfcfd4] p-[11px] shadow-[0_24px_40px_rgba(0,0,0,0.12)]">
        <div className="overflow-hidden rounded-[16px] bg-black">
          <div className="relative aspect-[4/3] overflow-hidden bg-[#0b1c33]">
            <Image src="/simulator/airspace.png" alt="AITC airspace editor on an iPad" fill className="object-cover object-top" sizes="(min-width: 1024px) 24vw, 80vw" />
          </div>
        </div>
      </div>
      <figcaption className="mt-6 text-[17px] text-ink">iPad</figcaption>
    </figure>
  );
}

export default function Devices() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-16 px-6 lg:flex-row lg:items-end lg:justify-center lg:gap-10">
      <div className="w-full max-w-sm lg:w-[30%]">
        <MacBook />
      </div>
      <div className="w-full max-w-xl lg:w-[42%]">
        <Imac />
      </div>
      <div className="w-full max-w-xs lg:w-[24%]">
        <Ipad />
      </div>
    </div>
  );
}
