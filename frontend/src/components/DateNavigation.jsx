import { ChevronLeft, ChevronRight } from "lucide-react";

const DateNavigation = ({ selectedDate, onDateChange }) => {
    const handlePrevDay = () => {
        const prevDate = new Date(selectedDate);
        prevDate.setDate(selectedDate.getDate() - 1);
        onDateChange(prevDate);
    };

    const handleNextDay = () => {
        const nextDate = new Date(selectedDate);
        nextDate.setDate(selectedDate.getDate() + 1);
        // Prevent going to future if needed, but for dummy navigation it's fine
        onDateChange(nextDate);
    };

    const formatDate = (date) => {
        // Format: 20/01/2026
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    return (
        <div className="flex items-center justify-between bg-gray-800 p-4 rounded-xl border border-gray-700 mb-6">
            <button
                onClick={handlePrevDay}
                className="p-2 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-white">{formatDate(selectedDate)}</span>
            </div>

            <button
                onClick={handleNextDay}
                className="p-2 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors"
            >
                <ChevronRight className="w-6 h-6" />
            </button>
        </div>
    );
};

export default DateNavigation;
