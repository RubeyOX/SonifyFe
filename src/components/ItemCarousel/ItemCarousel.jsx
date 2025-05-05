import React, { useRef, useState, useEffect, useCallback } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { debounce } from '../utils/debounce'; // Adjust path if needed, or paste function directly
import "./ItemCarousel.css";

function ItemCarousel({ children }) {
  const carouselRef = useRef(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const checkScrollPosition = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;

    const tolerance = 2; 

    const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);

    const atStart = el.scrollLeft <= tolerance;

    const atEnd = el.scrollLeft >= maxScrollLeft - tolerance;

    setIsAtStart(prevAtStart => {
      if (prevAtStart !== atStart) {
        return atStart;
      }
      return prevAtStart; // No change
    });

    setIsAtEnd(prevAtEnd => {
      if (prevAtEnd !== atEnd) {
        return atEnd;
      }
      return prevAtEnd; // No change
    });

    if (el.scrollWidth <= el.clientWidth + tolerance) { // Add tolerance here too
        setIsAtStart(true);
        setIsAtEnd(true);
    }

  }, []);

  const debouncedCheckScrollPosition = useCallback(
      debounce(checkScrollPosition, 150),
      [checkScrollPosition] 
  );

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    checkScrollPosition();

    el.addEventListener('scroll', debouncedCheckScrollPosition, { passive: true });

    const handleResizeOrMutation = () => checkScrollPosition();

    const resizeObserver = new ResizeObserver(handleResizeOrMutation);
    resizeObserver.observe(el);

    const mutationObserver = new MutationObserver(handleResizeOrMutation);
    mutationObserver.observe(el, { childList: true, subtree: true, characterData: true, attributes: true });

    return () => {
      el.removeEventListener('scroll', debouncedCheckScrollPosition); // Remove the correct one
      resizeObserver.unobserve(el);
      mutationObserver.disconnect();
    };
  }, [checkScrollPosition, debouncedCheckScrollPosition, children]);

  const scroll = (direction) => {
    const el = carouselRef.current;
    if (!el) return;

    const scrollAmount = el.clientWidth * 0.8;

    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });

  };

  return (
    <div className="item-carousel-wrapper">
      <div className="item-carousel" ref={carouselRef}>
        {children}
      </div>

      <button
        className={`carousel-controller left ${isAtStart ? 'hidden' : ''}`}
        onClick={() => scroll('left')}
        aria-label="Previous Item"
        disabled={isAtStart}
      >
        <ChevronLeftIcon />
      </button>

      <button
        className={`carousel-controller right ${isAtEnd ? 'hidden' : ''}`}
        onClick={() => scroll('right')}
        aria-label="Next Item"
        disabled={isAtEnd}
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
}

export default ItemCarousel;