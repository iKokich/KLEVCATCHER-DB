// src/components/ui/Stepper.js
import { createContext, useContext, useState } from 'react';
import './Stepper.css';

const StepperContext = createContext();

function Stepper({ defaultValue, orientation = 'vertical', children }) {
  const [currentStep, setCurrentStep] = useState(defaultValue);
  
  return (
    <StepperContext.Provider value={{ currentStep, setCurrentStep, orientation }}>
      <div className={`stepper stepper-${orientation}`}>
        {children}
      </div>
    </StepperContext.Provider>
  );
}

function StepperList({ children }) {
  const { orientation } = useContext(StepperContext);
  return (
    <div className={`stepper-list stepper-list-${orientation}`}>
      {children}
    </div>
  );
}

function StepperItem({ value, children }) {
  const { currentStep } = useContext(StepperContext);
  const isActive = currentStep === value;
  const steps = ['step1', 'step2', 'step3', 'step4'];
  const currentIndex = steps.indexOf(currentStep);
  const itemIndex = steps.indexOf(value);
  const isCompleted = itemIndex < currentIndex;
  
  return (
    <div className={`stepper-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
      {children}
    </div>
  );
}

function StepperTrigger({ children, className = '' }) {
  return (
    <div className={`stepper-trigger ${className}`}>
      {children}
    </div>
  );
}

function StepperIndicator() {
  return <div className="stepper-indicator" />;
}

function StepperTitle({ children }) {
  return <h4 className="stepper-title">{children}</h4>;
}

function StepperDescription({ children }) {
  return <p className="stepper-description">{children}</p>;
}

function StepperSeparator({ className = '' }) {
  return <div className={`stepper-separator ${className}`} />;
}

function StepperContent({ value, children, className = '' }) {
  const { currentStep } = useContext(StepperContext);
  if (currentStep !== value) return null;
  
  return (
    <div className={`stepper-content ${className}`}>
      {children}
    </div>
  );
}

export {
  Stepper,
  StepperList,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperTitle,
  StepperDescription,
  StepperSeparator,
  StepperContent
};
