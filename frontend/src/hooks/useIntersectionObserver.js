import { useState, useEffect, useRef } from 'react';

function useIntersectionObserver(options) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    // Создаем "наблюдателя"
    const observer = new IntersectionObserver(([entry]) => {
      // Когда элемент появляется в зоне видимости
      if (entry.isIntersecting) {
        // Устанавливаем состояние в `true`
        setIsIntersecting(true);
        // Отключаем наблюдение после того, как анимация сработала один раз
        observer.unobserve(entry.target);
      }
    }, options);

    // Начинаем наблюдение за элементом, к которому привязан `ref`
    if (ref.current) {
      observer.observe(ref.current);
    }

    // Функция очистки: прекращаем наблюдение, если компонент исчезает
    return () => {
      if (ref.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);

  // Возвращаем `ref` для привязки к элементу и состояние `isIntersecting`
  return [ref, isIntersecting];
}

export default useIntersectionObserver;