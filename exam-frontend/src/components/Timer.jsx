import React, { useState, useEffect, useRef } from 'react';

const Timer = ({ duration, onTimeUp }) => {
    const [timeLeft, setTimeLeft] = useState(duration * 60); // duration in minutes
    const intervalRef = useRef(null);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp();
            return;
        }
        intervalRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => {
            if (intervalRef.current) clearTimeout(intervalRef.current);
        };
    }, [timeLeft, onTimeUp]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const totalSeconds = duration * 60;
    const percentage = (timeLeft / totalSeconds) * 100;
    const isWarning = percentage <= 25;
    const isCritical = percentage <= 10;

    const getTimerColor = () => {
        if (isCritical) return 'text-red-600 bg-red-100';
        if (isWarning) return 'text-orange-600 bg-orange-100';
        return 'text-blue-600 bg-blue-100';
    };

    return (
        <div className={`flex items-center gap-3 px-4 py-2 rounded-lg font-bold ${getTimerColor()} transition-all duration-300`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-lg">{formatTime(timeLeft)}</span>
            {isWarning && (
                <span className="text-xs animate-pulse">
                    {isCritical ? '⚠️ Hurry!' : '⚠️ Warning'}
                </span>
            )}
        </div>
    );
};

export default Timer;

