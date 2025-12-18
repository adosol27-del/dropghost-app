import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { formatWeekRange } from '../lib/utils';

interface WeekNavigationProps {
  currentMonday: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
}

export default function WeekNavigation({
  currentMonday,
  onPreviousWeek,
  onNextWeek,
  onToday,
}: WeekNavigationProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <button
        onClick={onPreviousWeek}
        className="p-2 hover:bg-slate-100 rounded-lg transition"
        title="Semana anterior"
      >
        <ChevronLeft className="w-5 h-5 text-slate-600" />
      </button>

      <div className="flex items-center gap-3">
        <Calendar className="w-5 h-5 text-slate-600" />
        <span className="text-lg font-semibold text-slate-800">
          {formatWeekRange(currentMonday)}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToday}
          className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
        >
          Hoy
        </button>
        <button
          onClick={onNextWeek}
          className="p-2 hover:bg-slate-100 rounded-lg transition"
          title="Semana siguiente"
        >
          <ChevronRight className="w-5 h-5 text-slate-600" />
        </button>
      </div>
    </div>
  );
}
