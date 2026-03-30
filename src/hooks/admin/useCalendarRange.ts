import { useCallback, useState } from "react";

export default function useCalendarRange() {
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleDayPress = useCallback(
    (dateString: string) => {
      if (!rangeStart) {
        setRangeStart(dateString);
        setRangeEnd(null);
      } else if (!rangeEnd) {
        if (dateString < rangeStart) {
          setRangeEnd(rangeStart);
          setRangeStart(dateString);
        } else {
          setRangeEnd(dateString);
        }
        setShowModal(true);
      } else {
        setRangeStart(dateString);
        setRangeEnd(null);
      }
    },
    [rangeStart, rangeEnd],
  );

  const clearRange = () => {
    setRangeStart(null);
    setRangeEnd(null);
    setShowModal(false);
  };

  return {
    rangeStart,
    rangeEnd,
    showModal,
    handleDayPress,
    clearRange,
    setShowModal,
  };
}
