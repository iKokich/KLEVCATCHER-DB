export const sparkOptions = {
  fullScreen: {
    enable: false
  },
  detectRetina: true,
  background: {
    color: "transparent"
  },
  fpsLimit: 120,
  emitters: {
    // ... (без изменений)
  },
  particles: {
    number: {
      value: 0
    },
    color: {
      // ИЗМЕНЕНИЕ: Цвета искр для новой темной темы
      value: ["#1B1A55", "#535C91", "#9290C3"]
    },
    shape: {
      type: "circle"
    },
    // ... (остальное без изменений)
  }
};