"use client";

import Image from "next/image";
import Link from "next/link";
import { Carousel, CarouselContent, CarouselItem } from "@/shared/ui/carousel";

import { categories } from "../model";

/**
 * 공연 카테고리 캐러셀 컴포넌트
 */
const PerformanceCategory = () => {
  return (
    <Carousel
      opts={{
        align: "start",
        watchDrag: false,
        breakpoints: {
          "(min-width: 768px)": { watchDrag: false },
          "(max-width: 767px)": { watchDrag: true },
        },
      }}
      className="wrapper pe-0 sm:ps-2"
    >
      <CarouselContent className="md:justify-center">
        {categories.map((category) => (
          <CarouselItem
            key={category.id}
            className="pl-4 lg:pl-9 basis-[16.9%] min-w-20 max-w-[110px] lg:max-w-[146px] sm:basic-1/7"
          >
            <div className="flex flex-col items-center space-y-2 cursor-pointer group grow">
              <Link
                href={`#${category.value}`}
                className="relative w-full aspect-[4/5] overflow-hidden transition-shadow bg-gray-100 rounded-full shadow-sm group-hover:shadow-md"
              >
                <Image
                  src={`/images/home/category/${category.image}`}
                  alt={category.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 25vw, 15vw"
                />
              </Link>
              <span className="text-xs tracking-tighter text-gray-700 transition-colors sm:text-sm group-hover:text-gray-900">
                {category.name}
              </span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};

export default PerformanceCategory;
