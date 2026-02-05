export const getTodayDate = ()=>{
  return new Date().toISOString().split("T")[0];
};
export const getTodayDisplayDate=()=>{
return new Date().toDateString();
}
export const formatTime= (iso: string | null)=>{
  if(!iso) return "--";
  const date= new Date(iso);
  return date.toLocaleDateString([],{
    hour:"2-digit",
    minute:"2-digit",
  });
}
export const getMonthKey = (iso: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // 01-12
  return `${date.getFullYear()}-${month}`;
};
