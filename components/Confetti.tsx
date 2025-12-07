import React, { useEffect, useState } from 'react';

interface ConfettiPiece {
    id: number;
    x: number;
    delay: number;
    color: string;
    size: number;
}

const COLORS = ['#C17C54', '#8A9A5B', '#F9F7F2', '#E5E2DC', '#686C73', '#FBBF24', '#F472B6'];

const Confetti: React.FC = () => {
    const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

    useEffect(() => {
        const newPieces: ConfettiPiece[] = [];
        for (let i = 0; i < 60; i++) {
            newPieces.push({
                id: i,
                x: Math.random() * 100,
                delay: Math.random() * 0.5,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                size: Math.random() * 8 + 4
            });
        }
        setPieces(newPieces);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {pieces.map((piece) => (
                <div
                    key={piece.id}
                    className="absolute animate-confetti-fall"
                    style={{
                        left: `${piece.x}%`,
                        animationDelay: `${piece.delay}s`,
                        width: piece.size,
                        height: piece.size * 1.5,
                        backgroundColor: piece.color,
                        borderRadius: '2px',
                        transform: `rotate(${Math.random() * 360}deg)`,
                    }}
                />
            ))}
            <style>{`
                @keyframes confetti-fall {
                    0% {
                        transform: translateY(-20px) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(720deg);
                        opacity: 0;
                    }
                }
                .animate-confetti-fall {
                    animation: confetti-fall 3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Confetti;
