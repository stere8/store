import React from "react";
import { ClipLoader } from "react-spinners";

export default function Loading({ loading }: { loading: boolean }) {
  return (
    <div>
      {loading ? (
        <ClipLoader
          className="fixed inset-0 m-auto z-20 animate-bounce"
          size={100}
          color="#331B0A"
        />
      ) : (
        ""
      )}
    </div>
  );
}
