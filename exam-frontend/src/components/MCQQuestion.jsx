import React, { useState, useEffect } from 'react';

const MCQQuestion = ({ question, onAnswer, savedAnswer = '' }) => {
    const [selected, setSelected] = useState(savedAnswer || '');

    useEffect(() => {
        if (savedAnswer) {
            setSelected(savedAnswer);
        }
    }, [savedAnswer]);

    const handleChange = (option) => {
        setSelected(option);
        onAnswer(option);
    };

    const getOptionLabel = (index) => {
        return String.fromCharCode(65 + index); // A, B, C, D, etc.
    };

    return (
        <div className="space-y-3">
            <div className="space-y-3">
                {(question.options || []).map((option, index) => {
                    const optionId = `option-${index}`;
                    const isSelected = selected === option;
                    return (
                        <label
                            key={index}
                            htmlFor={optionId}
                            className={`
                                flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                                ${isSelected
                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                                }
                            `}
                        >
                            <div className="flex items-center min-w-[2.5rem]">
                                <input
                                    type="radio"
                                    id={optionId}
                                    name={`mcq-${question.questionId}`}
                                    value={option}
                                    checked={isSelected}
                                    onChange={() => handleChange(option)}
                                    className="w-5 h-5 text-blue-600 focus:ring-blue-500 focus:ring-2 cursor-pointer"
                                />
                                <span className={`
                                    ml-3 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                    ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}
                                `}>
                                    {getOptionLabel(index)}
                                </span>
                            </div>
                            <span className="ml-4 text-gray-800 flex-1 pt-1">{option}</span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
};

export default MCQQuestion;
