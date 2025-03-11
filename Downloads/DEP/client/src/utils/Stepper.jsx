import React from "react";

const Stepper = ({ steps, currentStep, setCurrentStep }) => {
    return (
        <div className="flex justify-center p-4 bg-gray-100 shadow-md">
            {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center mx-4">
                    <button
                        className={`w-10 h-10 flex items-center justify-center rounded-full border-2 font-bold text-sm transition-all ${currentStep === index + 1
                            ? "bg-green-600 text-white border-green-600"
                            : "bg-gray-300 text-gray-700 border-gray-400"
                            }`}
                        onClick={() => setCurrentStep(index)}
                    >
                        {index + 1}
                    </button>
                    <span className="text-xs mt-2 text-center w-20">{step}</span>
                </div>
            ))}
        </div>
    );
};

export default Stepper;
