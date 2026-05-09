import React, { useRef, useEffect, useState } from 'react';
import clsx from 'clsx';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
}

export function LazyImage({ src, alt, className, containerClassName, ...props }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let observer: IntersectionObserver;
    
    if (imgRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              if (observer && imgRef.current) observer.unobserve(imgRef.current);
            }
          });
        },
        { rootMargin: '100px 0px' }
      );
      
      observer.observe(imgRef.current);
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, []);

  return (
    <div className={clsx('relative overflow-hidden', containerClassName)}>
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={clsx(
            className,
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setIsLoaded(true)}
          {...props}
        />
      )}
      {!isInView && <div ref={imgRef} className="w-full h-full bg-surface-container" />}
    </div>
  );
}
