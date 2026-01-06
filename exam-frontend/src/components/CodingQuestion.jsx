import React, { useState } from 'react';

const CodingQuestion = ({ question, onAnswer }) => {
    const [code, setCode] = useState('');

    const handleChange = (e) => {
        setCode(e.target.value);
        onAnswer(e.target.value);
    };

    return (
        <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
            <textarea
                value={code}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded font-mono"
                rows="10"
                placeholder="Write your code here..."
            />
        </div>
    );
};

export default CodingQuestion;
