"use client";

import dynamic from "next/dynamic";
import { Navbar } from "../../src/components/ui/navbar";
import { Footer } from "../../src/components/ui/footer";

const RegionMap = dynamic(() => import("./RegionMap"), { ssr: false });

const regional_performance = [
  {
    region: "Abu Dhabi",
    country: "UAE",
    lat: 24.4539,
    lng: 54.3773,
    revenue: 96818.4,
    spend: 2262,
  },
  {
    region: "Dubai",
    country: "UAE",
    lat: 25.276987,
    lng: 55.296249,
    revenue: 82987.2,
    spend: 1938.86,
  },
  {
    region: "Sharjah",
    country: "UAE",
    lat: 25.3463,
    lng: 55.4209,
    revenue: 41493.6,
    spend: 969.43,
  },
  {
    region: "Riyadh",
    country: "Saudi Arabia",
    lat: 24.7136,
    lng: 46.6753,
    revenue: 22129.92,
    spend: 517.03,
  },
  {
    region: "Doha",
    country: "Qatar",
    lat: 25.2854,
    lng: 51.531,
    revenue: 16597.44,
    spend: 387.77,
  },
  {
    region: "Kuwait City",
    country: "Kuwait",
    lat: 29.3759,
    lng: 47.9774,
    revenue: 11064.96,
    spend: 258.51,
  },
  {
    region: "Manama",
    country: "Bahrain",
    lat: 26.2285,
    lng: 50.586,
    revenue: 5532.48,
    spend: 129.26,
  },
];

export default function RegionView() {
  return (
    <div className="flex h-screen bg-gray-900">
      <Navbar />

      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-12">
          <div className="px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-bold">Region View</h1>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="h-[600px] w-full">
            <RegionMap regional_performance={regional_performance} />
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
