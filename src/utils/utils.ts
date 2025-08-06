//Expects dates of the form yyyy-mm-dd (as they are stored on the backend)
//Use this - NOT new Date().toLocaleString()! THIS WILL SHIFT THE DATE BACK A DAY (stupid timezone thing)
export function formatDateString(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${Number(month)}/${Number(day)}/${year}`; // e.g., 7/8/2025
}