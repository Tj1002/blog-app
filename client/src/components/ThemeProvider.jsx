import React, { Children } from "react";
import { useSelector } from "react-redux";

function ThemeProvider() {
  const { theme } = useSelector((state) => state.theme);
  return (
    <div className={theme}>
      <div className="bg-white text-gray-700 dark:text-gray-200 dark:bg-[rgb(16,23,42)] min-h-screen">
        {Children}
      </div>
    </div>
  );
}

export default ThemeProvider;
