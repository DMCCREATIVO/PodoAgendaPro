import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  number: number;
  title: string;
  description: string;
}

interface BookingStepperProps {
  currentStep: number;
  steps: Step[];
}

export function BookingStepper({ currentStep, steps }: BookingStepperProps) {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          
          return (
            <div key={step.number} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center font-semibold transition-all duration-300",
                    isCompleted && "bg-accent text-accent-foreground scale-110",
                    isCurrent && "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/30",
                    !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="w-6 h-6" /> : step.number}
                </div>
                <div className="mt-3 text-center">
                  <div
                    className={cn(
                      "font-heading font-semibold text-sm transition-colors",
                      isCurrent && "text-foreground",
                      !isCurrent && "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 hidden sm:block">
                    {step.description}
                  </div>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-muted mx-4 relative top-[-28px]">
                  <div
                    className={cn(
                      "h-full bg-accent transition-all duration-500",
                      isCompleted ? "w-full" : "w-0"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}