import React, { useState, useEffect } from 'react';

const TheoryQuestion = ({ question, onAnswer, savedAnswer = '' }) => {
    const [answer, setAnswer] = useState(savedAnswer || '');
    const [wordCount, setWordCount] = useState(0);

    useEffect(() => {
        if (savedAnswer) {
            setAnswer(savedAnswer);
            setWordCount(savedAnswer.trim().split(/\s+/).filter(word => word.length > 0).length);
        }
    }, [savedAnswer]);

    const handleChange = (e) => {
        const value = e.target.value;
        setAnswer(value);
        const words = value.trim().split(/\s+/).filter(word => word.length > 0);
        setWordCount(words.length);
        onAnswer(value);
    };

    return (
        <div className="space-y-3">
            <div className="relative">
                <textarea
                    value={answer}
                    onChange={handleChange}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 resize-y min-h-[200px] font-mono text-gray-800"
                    rows="8"
                    placeholder="Write your detailed answer here... Be thorough and clear in your response."
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-500 bg-white px-2 py-1 rounded">
                    {wordCount} {wordCount === 1 ? 'word' : 'words'}
                </div>
            </div>
        </div>
    );
};

export default TheoryQuestion;
