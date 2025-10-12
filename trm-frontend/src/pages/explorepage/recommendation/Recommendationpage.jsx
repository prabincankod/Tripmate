import React, { useState } from "react";
import RecommendationFormUI from "../recommendation/RecommendationForm"

const ROLES = ["Normal User", "Travel Blogger", "Local Guide"];


const RecommendationPage = () => {
  const [selectedRole, setSelectedRole] = useState("");
  const [formVisible, setFormVisible] = useState(false);

  const handleRoleSelection = (role) => {
    setSelectedRole(role);
    setFormVisible(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start p-4">
      {!formVisible ? (
        <>
          <h1 className="text-3xl font-bold mt-8 mb-6 text-green-800">
            Who are you?
          </h1>
          <div className="flex flex-col gap-4">
            {ROLES.map((role) => (
              <button
                key={role}
                onClick={() => handleRoleSelection(role)}
                className="py-3 px-6 rounded-xl font-bold border-2 border-green-700 text-green-700 hover:bg-green-100 transition"
              >
                {role}
              </button>
            ))}
          </div>
        </>
      ) : (
        <RecommendationFormUI initialCredential={selectedRole} onSubmitted={() => setFormVisible(false)} />
      )}
    </div>
  );
};

export default RecommendationPage;
