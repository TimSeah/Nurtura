const calculateDaysAgo = (date: string): string => {
  const daysAgo = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));

  return `${daysAgo} days ago`;
}

export {calculateDaysAgo };