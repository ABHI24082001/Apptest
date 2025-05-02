import { format, startOfYear, addDays, getDaysInYear } from 'date-fns';

export const generateShiftSchedule = () => {
  const shifts = ['Day', 'Night', 'Morning'];
  const startDate = startOfYear(new Date());
  const totalDays = getDaysInYear(startDate);

  const schedule = {};

  for (let i = 0; i < totalDays; i++) {
    const date = addDays(startDate, i);
    const dateString = format(date, 'yyyy-MM-dd');

    const shiftCycleDay = i % 21;
    if (shiftCycleDay < 7) {
      schedule[dateString] = 'Day';
    } else if (shiftCycleDay < 14) {
      schedule[dateString] = 'Night';
    } else {
      schedule[dateString] = 'Morning';
    }
  }

  // Add random holidays and week offs (e.g., 24 holidays + 52 week offs = approx 1 per week)
  const addSpecialDays = (label, count) => {
    let added = 0;
    while (added < count) {
      const day = Math.floor(Math.random() * totalDays);
      const date = format(addDays(startDate, day), 'yyyy-MM-dd');
      if (!['Holiday', 'Week Off'].includes(schedule[date])) {
        schedule[date] = label;
        added++;
      }
    }
  };

  addSpecialDays('Holiday', 24);   // 2 per month approx
  addSpecialDays('Week Off', 52);  // 1 per week

  return schedule;
};
