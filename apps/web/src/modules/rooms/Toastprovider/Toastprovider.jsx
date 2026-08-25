import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";

// Export toast directly from here so you never import from react-toastify elsewhere
export { toast };

export default function ToastProvider() {
  return createPortal(
    <ToastContainer
      position="bottom-right"
      theme="dark"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      pauseOnHover
    />,
    document.body
  );
}
