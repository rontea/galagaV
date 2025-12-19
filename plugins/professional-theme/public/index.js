
(function(global) {
  const React = global.React;

  const ProfessionalTheme = ({ theme, onNotify }) => {
    React.useEffect(() => {
      onNotify("Professional System Theme Engine Initialized.");
    }, []);

    return React.createElement('div', { className: "p-12 flex flex-col items-center justify-center text-center font-sans h-full bg-[#F4F5F7] dark:bg-[#091E42] text-[#172B4D] dark:text-[#EBECF0]" },
      React.createElement('div', { className: "w-16 h-16 bg-[#0052CC] rounded-full flex items-center justify-center text-white mb-6 shadow-lg" },
        // Fixed: Use colon instead of equals sign in object literal for strokeLinejoin to resolve syntax error
        React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: "32", height: "32", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
          React.createElement('path', { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" })
        )
      ),
      React.createElement('h1', { className: "text-2xl font-bold mb-2" }, "Professional System Theme"),
      React.createElement('p', { className: "text-[#5E6C84] dark:text-[#97A0AF] max-w-sm text-sm leading-relaxed" }, 
        "The system-wide enterprise design language is active. Global styles, typography, and color palettes have been overridden to meet professional protocol standards."
      ),
      React.createElement('div', { className: "mt-8 grid grid-cols-2 gap-4" },
        React.createElement('div', { className: "px-4 py-2 bg-white dark:bg-black/20 border border-[#DFE1E6] dark:border-[#253858] rounded text-[10px] font-mono font-bold uppercase tracking-tighter" }, `Mode: ${theme}`),
        React.createElement('div', { className: "px-4 py-2 bg-white dark:bg-black/20 border border-[#DFE1E6] dark:border-[#253858] rounded text-[10px] font-mono font-bold uppercase tracking-tighter" }, "Version: 1.1.0_SYS")
      )
    );
  };

  global.GalagaPlugin_ProfessionalTheme = { Component: ProfessionalTheme };
})(window);
