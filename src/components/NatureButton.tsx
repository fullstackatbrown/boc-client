"use client";
import { useEffect, useState } from "react";

function WhiteButton(props: { text: string; onClick: () => void }) {
  const { text, onClick } = props;

  return (
    <button
      onClick={onClick}
      className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition ease-in-out duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
    >
      {text}
    </button>
  );
}
export default WhiteButton; // Make sure to export the component
