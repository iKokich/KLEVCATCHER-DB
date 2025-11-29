// src/components/GetHelpModal.js
import { useState } from 'react';
import { BiX } from 'react-icons/bi';
import './GetHelpModal.css';

const steps = [
  {
    value: 'step1',
    number: 1,
    title: 'Account Setup',
    description: 'Create your account and verify email',
    content: 'Welcome to KlevCatcher! Start by creating your account and verifying your email address. This will give you access to all the powerful threat detection features.'
  },
  {
    value: 'step2',
    number: 2,
    title: 'Dashboard Overview',
    description: 'Explore the main dashboard features',
    content: 'The Dashboard provides an overview of your security status. You can view reports, threats, and recent activity. Navigate using the sidebar to access different sections.'
  },
  {
    value: 'step3',
    number: 3,
    title: 'Creating Reports',
    description: 'Learn how to create and manage reports',
    content: 'Go to the Projects section to create new malware analysis reports. Upload files or enter hashes to analyze. Your reports will be saved and accessible from the Reports section.'
  },
  {
    value: 'step4',
    number: 4,
    title: 'Sigma Rules',
    description: 'Work with detection rules',
    content: 'Access the Sigma Rules section to view, create, and manage detection rules. You can also browse the Data Library for pre-built rules and export them for use in your SIEM.'
  }
];

function GetHelpModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState('step1');

  if (!isOpen) return null;

  const currentIndex = steps.findIndex(s => s.value === currentStep);
  const currentStepData = steps[currentIndex];

  const goToStep = (stepValue) => {
    setCurrentStep(stepValue);
  };

  const goNext = () => {
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].value);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].value);
    }
  };

  return (
    <div className="get-help-overlay" onClick={onClose}>
      <div className="get-help-modal" onClick={(e) => e.stopPropagation()}>
        <button className="get-help-close" onClick={onClose}>
          <BiX />
        </button>

        {/* Horizontal Stepper */}
        <div className="get-help-stepper">
          {steps.map((step, index) => {
            const isActive = currentStep === step.value;
            const isCompleted = index < currentIndex;
            
            return (
              <div 
                key={step.value} 
                className={`get-help-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => goToStep(step.value)}
              >
                <div className="get-help-step-indicator">
                  {isCompleted ? '✓' : step.number}
                </div>
                {index < steps.length - 1 && (
                  <div className={`get-help-step-line ${isCompleted ? 'completed' : ''}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div className="get-help-content">
          <h3>{currentStepData.title}</h3>
          <p className="get-help-description">{currentStepData.description}</p>
          <p className="get-help-text">{currentStepData.content}</p>
        </div>

        {/* Navigation */}
        <div className="get-help-navigation">
          <button 
            className="get-help-btn get-help-btn-secondary"
            onClick={goPrev}
            disabled={currentIndex === 0}
          >
            Previous
          </button>
          {currentIndex < steps.length - 1 ? (
            <button className="get-help-btn get-help-btn-primary" onClick={goNext}>
              Next
            </button>
          ) : (
            <button className="get-help-btn get-help-btn-primary" onClick={onClose}>
              Get Started
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default GetHelpModal;
