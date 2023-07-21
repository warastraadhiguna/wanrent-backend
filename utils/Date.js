export const GetCurrentDate = () => {
  const d = new Date();
  return (
    [d.getFullYear(), d.getMonth() + 1, d.getDate()].join("/") +
    " " +
    [d.getHours(), d.getMinutes(), d.getSeconds()].join(":")
  );
};
