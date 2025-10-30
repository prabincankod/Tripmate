// src/pages/payment/SuccessPage.jsx
import React, { useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SuccessPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/Homepage"); // Redirect to homepage
    }, 3000); // 3 seconds

    // Cleanup the timer if the component unmounts
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
        <CheckCircle className="mx-auto text-green-500 w-16 h-16 mb-4" />

        <h1 className="text-2xl font-semibold text-gray-800">
          Payment Successful 🎉
        </h1>
        <p className="text-gray-600 mt-2">
          Your payment through eSewa has been completed successfully.
        </p>
      </div>
    </div>
  );
};

export default SuccessPage;

