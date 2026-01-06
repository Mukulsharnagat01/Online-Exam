import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ initialSeconds, onComplete }) => {
    const [seconds, setSeconds] = useState(initialSeconds);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval = null;
        
        if (isActive && seconds > 0) {
            interval = setInterval(() => {
                setSeconds(prevSeconds => {
                    if (prevSeconds <= 1) {
                        clearInterval(interval);
                        onComplete();
                        return 0;
                    }
                    return prevSeconds - 1;
                });
            }, 1000);
        }
        
        return () => clearInterval(interval);
    }, [isActive, seconds, onComplete]);

    const startTimer = () => setIsActive(true);
    const pauseTimer = () => setIsActive(false);
    const resetTimer = () => {
        setIsActive(false);
        setSeconds(initialSeconds);
    };

    const formatTime = () => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="countdown-timer">
            <div className="text-4xl font-bold text-center mb-4">
                {formatTime()}
            </div>
            <div className="flex justify-center space-x-4">
                <button 
                    onClick={startTimer}
                    className="px-4 py-2 bg-green-500 text-white rounded"
                    disabled={isActive}
                >
                    Start
                </button>
                <button 
                    onClick={pauseTimer}
                    className="px-4 py-2 bg-yellow-500 text-white rounded"
                    disabled={!isActive}
                >
                    Pause
                </button>
                <button 
                    onClick={resetTimer}
                    className="px-4 py-2 bg-red-500 text-white rounded"
                >
                    Reset
                </button>
            </div>
        </div>
    );
};

export default CountdownTimer;