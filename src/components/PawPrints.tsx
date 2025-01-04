import React from "react";
import Image from "next/image";
import image1 from "@/assets/images/image1.png";
import singlepaw from "@/assets/images/PAW.png";

const PawPrints = () => {
  const pawPrintImages = [
    {
      src: singlepaw,
      styles:
        "top-[80%] left-[62%] transform-[-40deg] w-[50px] h-[50px] filter-[contrast(110%) brightness(105%)]",
      objectPosition: "20% 20%",
    },
    {
      src: singlepaw,
      styles:
        "top-[69%] left-[59%] transform-[-40deg] w-[50px] h-[50px] filter-[contrast(110%) brightness(105%)]",
      objectPosition: "20% 20%",
    },
    {
      src: image1,
      styles:
        "top-[51%] left-[55%] transform-[-30deg] scale-x-[-1] w-[100px] h-[100px] filter-[contrast(110%) brightness(105%)]",
      objectPosition: "center bottom",
    },
    {
      src: image1,
      styles:
        "bottom-[47%] left-[53%] transform-[-9deg] w-[100px] h-[100px] filter-[contrast(110%) brightness(105%)]",
      objectPosition: "25% 25%",
    },
  ];
  return (
    <div>
      {pawPrintImages.map((imageData, index) => (
        <div
          key={index}
          className={"absolute overflow-hidden w-[100px] h-[100px] " + imageData.styles}
        >
          <Image
            src={imageData.src}
            alt={`Paw print ${index + 1}`}
            fill
            sizes="100vw, 50vw, 33vw"
            style={{
              objectFit: "cover",
              objectPosition: imageData.objectPosition || "center center",
            }}
          />
        </div>
      ))}
    </div>
  );
};
export default PawPrints;
