'use client';

import React, { useState } from 'react';

import Button from '@/components/global/Button';

import { BrewRecommendation, SelectionState } from './types';
import { getBrewRecommendation } from './utils';
import { Clock, Coffee, Users, Zap } from 'lucide-react';

interface SimpleModeProps {
    onReset: () => void;
}

const SimpleMode = ({ onReset }: SimpleModeProps) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [selections, setSelections] = useState<SelectionState>({
        beanType: '',
        timeAvailable: '',
        equipment: '',
        servings: ''
    });
    const [recommendation, setRecommendation] = useState<BrewRecommendation | null>(null);
    const [showResults, setShowResults] = useState(false);

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        } else {
            const brewRec = getBrewRecommendation(selections);
            setRecommendation(brewRec);
            setShowResults(true);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const resetRecommender = () => {
        setCurrentStep(1);
        setSelections({
            beanType: '',
            timeAvailable: '',
            equipment: '',
            servings: ''
        });
        setRecommendation(null);
        setShowResults(false);
    };

    const isStepComplete = (step: number) => {
        switch (step) {
            case 1:
                return selections.beanType !== '';
            case 2:
                return selections.timeAvailable !== '';
            case 3:
                return selections.equipment !== '';
            case 4:
                return selections.servings !== '';
            default:
                return false;
        }
    };

    if (showResults && recommendation) {
        return (
            <div>
                <div className='mb-6 rounded-lg bg-customSecondary p-4 md:p-6'>
                    <h3 className='mb-4 text-lg font-bold text-customPrimary md:text-xl'>{recommendation.method}</h3>

                    <div className='mb-4 grid grid-cols-2  gap-4 md:grid-cols-3'>
                        <div className='text-center'>
                            <div className='text-sm font-semibold text-customDarkGray'>Coffee</div>
                            <div className='text-base font-bold text-customPrimary md:text-lg'>
                                {recommendation.coffeeAmount}
                            </div>
                        </div>
                        <div className='text-center'>
                            <div className='text-sm font-semibold text-customDarkGray'>Water</div>
                            <div className='text-base font-bold text-customPrimary md:text-lg'>
                                {recommendation.waterAmount}
                            </div>
                        </div>
                        <div className='text-center'>
                            <div className='text-sm font-semibold text-customDarkGray'>Temperature</div>
                            <div className='text-base font-bold text-customPrimary md:text-lg'>
                                {recommendation.temperature}
                            </div>
                        </div>
                        <div className='text-center'>
                            <div className='text-sm font-semibold text-customDarkGray'>Time</div>
                            <div className='text-base font-bold text-customPrimary md:text-lg'>
                                {recommendation.brewTime}
                            </div>
                        </div>
                        <div className='text-center'>
                            <div className='text-sm font-semibold text-customDarkGray'>Grind</div>
                            <div className='text-base font-bold text-customPrimary md:text-lg'>
                                {recommendation.grindSize}
                            </div>
                        </div>
                    </div>
                </div>

                <div className='mb-6 px-2'>
                    <h4 className='mb-3 text-base font-semibold text-customPrimary md:text-lg'>Brewing Steps:</h4>
                    <ol className='space-y-3'>
                        {recommendation.steps.map((step, index) => (
                            <li key={index} className='flex items-center'>
                                <span className='mr-3 mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-customTertiary text-sm font-bold text-white'>
                                    {index + 1}
                                </span>
                                <span className='text-sm text-customDarkGray md:text-base'>{step}</span>
                            </li>
                        ))}
                    </ol>
                </div>

                {/* TODO: Item recommendation feature - temporarily commented out
                {recommendation.equipmentSuggestion && (
                    <div className='mb-6 rounded-lg border border-customGray p-4'>
                        <h4 className='mb-2 text-base font-semibold text-customPrimary md:text-lg'>
                            Recommended Equipment
                        </h4>
                        <div className='flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0'>
                            <div>
                                <p className='font-medium text-customPrimary'>
                                    {recommendation.equipmentSuggestion.name}
                                </p>
                                <p className='text-sm text-customDarkGray'>
                                    {recommendation.equipmentSuggestion.reason}
                                </p>
                            </div>
                            <div className='text-left md:text-right'>
                                <p className='text-lg font-bold text-customPrimary'>
                                    {recommendation.equipmentSuggestion.price}
                                </p>
                                <button className='text-sm font-medium text-customTertiary hover:text-customPrimary'>
                                    View Item →
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                */}

                <div className='flex flex-col gap-3 md:flex-row'>
                    <div>
                        <Button
                            onClick={resetRecommender}
                            className='flex-1 bg-customDarkGray hover:border-customPrimary hover:bg-customPrimary hover:text-white'>
                            Try Another Recipe
                        </Button>
                    </div>
                    {/* <Button className='flex-1'>Save My Recipe</Button> */}
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Progress Indicator */}
            <div className='mb-6 flex w-full items-center justify-between pt-2'>
                {[1, 2, 3, 4].map((step, index) => (
                    <React.Fragment key={step}>
                        <div
                            className={`z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                                currentStep >= step
                                    ? 'bg-customTertiary text-white'
                                    : 'bg-customGray text-customDarkGray'
                            }`}>
                            {step}
                        </div>
                        {step < 4 && (
                            <div
                                className={`h-1 flex-1 ${currentStep > step ? 'bg-customTertiary' : 'bg-customGray'}`}
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Step Content */}
            <div className='mb-8'>
                {currentStep === 1 && (
                    <div>
                        <h3 className='mb-4 flex items-center text-lg font-semibold text-customPrimary md:text-xl'>
                            {/* <Coffee className='mr-2 h-5 w-5 text-customTertiary' /> */}
                            What type of coffee beans do you have?
                        </h3>
                        <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
                            {[
                                { value: 'light', label: 'Light Roast', desc: 'Bright & fruity' },
                                { value: 'medium', label: 'Medium Roast', desc: 'Balanced & smooth' },
                                { value: 'dark', label: 'Dark Roast', desc: 'Bold & strong' }
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setSelections({ ...selections, beanType: option.value })}
                                    className={`rounded-lg border-2 p-4 text-left transition-all ${
                                        selections.beanType === option.value
                                            ? 'border-customTertiary bg-customSecondary'
                                            : 'border-customGray hover:border-customTertiary'
                                    }`}>
                                    <div className='text-base font-semibold text-customPrimary'>{option.label}</div>
                                    <div className='text-sm text-customDarkGray'>{option.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div>
                        <h3 className='mb-4 flex items-center text-lg font-semibold text-customPrimary md:text-xl'>
                            <Clock className='mr-2 h-5 w-5 text-customTertiary' />
                            How much time do you have?
                        </h3>
                        <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
                            {[
                                { value: 'quick', label: 'Quick', desc: '2-5 minutes' },
                                { value: 'normal', label: 'Normal', desc: '5-10 minutes' },
                                { value: 'leisurely', label: 'Take My Time', desc: '10+ minutes' }
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setSelections({ ...selections, timeAvailable: option.value })}
                                    className={`rounded-lg border-2 p-4 text-left transition-all ${
                                        selections.timeAvailable === option.value
                                            ? 'border-customTertiary bg-customSecondary'
                                            : 'border-customGray hover:border-customTertiary'
                                    }`}>
                                    <div className='text-base font-semibold text-customPrimary'>{option.label}</div>
                                    <div className='text-sm text-customDarkGray'>{option.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div>
                        <h3 className='mb-4 flex items-center text-lg font-semibold text-customPrimary md:text-xl'>
                            <Zap className='mr-2 h-5 w-5 text-customTertiary' />
                            What equipment do you have?
                        </h3>
                        <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                            {[
                                { value: 'aeropress', label: 'AeroPress', desc: 'Quick & clean' },
                                { value: 'french-press', label: 'French Press', desc: 'Rich & full-bodied' },
                                { value: 'pour-over', label: 'Pour Over (V60/Chemex)', desc: 'Clean & bright' },
                                { value: 'moka-pot', label: 'Moka Pot', desc: 'Strong & intense' },
                                { value: 'none', label: 'I need equipment!', desc: 'Show me what to buy' }
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setSelections({ ...selections, equipment: option.value })}
                                    className={`rounded-lg border-2 p-4 text-left transition-all ${
                                        selections.equipment === option.value
                                            ? 'border-customTertiary bg-customSecondary'
                                            : 'border-customGray hover:border-customTertiary'
                                    }`}>
                                    <div className='text-base font-semibold text-customPrimary'>{option.label}</div>
                                    <div className='text-sm text-customDarkGray'>{option.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {currentStep === 4 && (
                    <div>
                        <h3 className='mb-4 flex items-center text-lg font-semibold text-customPrimary md:text-xl'>
                            <Users className='mr-2 h-5 w-5 text-customTertiary' />
                            How many people are you brewing for?
                        </h3>
                        <div className='grid grid-cols-1 gap-3  md:grid-cols-3'>
                            {[
                                { value: '1', label: 'Just Me', desc: '1 cup' },
                                { value: '2', label: 'For Two', desc: '2 cups' },
                                { value: '3+', label: 'Group', desc: '3+ cups' }
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setSelections({ ...selections, servings: option.value })}
                                    className={`rounded-lg border-2 p-4 text-left transition-all ${
                                        selections.servings === option.value
                                            ? 'border-customTertiary bg-customSecondary'
                                            : 'border-customGray hover:border-customTertiary'
                                    }`}>
                                    <div className='text-base font-semibold text-customPrimary'>{option.label}</div>
                                    <div className='text-sm text-customDarkGray'>{option.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className='flex flex-col gap-3 md:flex-row'>
                <Button
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className='flex-1 bg-customDarkGray hover:border-customPrimary hover:bg-customPrimary hover:text-white disabled:opacity-30'>
                    Back
                </Button>
                <Button onClick={handleNext} disabled={!isStepComplete(currentStep)} className='flex-1'>
                    {currentStep === 4 ? 'Get My Recipe' : 'Next'}
                </Button>
            </div>
        </div>
    );
};

export default SimpleMode;
