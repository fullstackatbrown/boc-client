"use client";
import { useEffect, useState } from "react";

function WhiteButton(props: { text: string; onClick: () => void }) {
  const { text, onClick } = props;
  
  return (
    <button
      onClick={onClick}
      className={`bg-white hover:bg-white-700 text-black font-bold py-4 px-8 rounded-lg text-lg`}
    >
      {text}
    </button>
  );
}
export default WhiteButton; // Make sure to export the component
