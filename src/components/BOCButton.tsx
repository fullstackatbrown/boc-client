"use client";
import { useEffect, useState } from "react";

function BOCButton(props: { text: string; onClick: () => void }) {
  const { text, onClick } = props;

  return (
    <button
      onClick={onClick}
      className="align-middle px-6 h-12 bg-boc_darkgreen text-white font-bold 
      rounded-lg hover:bg-boc_green transition ease-in-out duration-300"
    >
      {text}
    </button>
  );
}
export default BOCButton; // Make sure to export the component
