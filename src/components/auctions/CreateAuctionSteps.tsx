import { Check } from 'lucide-react';

const STEPS = ['Amount', 'Pricing', 'Duration', 'Review'];

export function CreateAuctionSteps({ current }: { current: number }) {
    return (
        <div className="mb-7 flex items-center">
            {STEPS.map((label, index) => {
                const step = index + 1;
                const isDone = step < current;
                const isActive = step === current;
                return (
                    <div key={label} className="flex flex-1 items-center">
                        <div className="flex flex-col items-center">
                            <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                                    isDone
                                        ? 'bg-indigo-600 text-white'
                                        : isActive
                                            ? 'border-2 border-indigo-600 bg-indigo-50 text-indigo-600'
                                            : 'bg-muted text-muted-foreground'
                                }`}
                            >
                                {isDone ? <Check size={14} /> : step}
                            </div>
                            <div className={`mt-1 text-xs font-medium whitespace-nowrap ${isDone || isActive ? 'text-indigo-600' : 'text-muted-foreground'}`}>
                                {label}
                            </div>
                        </div>
                        {step < STEPS.length && (
                            <div className={`mx-1.5 h-0.5 flex-1 ${isDone ? 'bg-indigo-600' : 'bg-border'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
