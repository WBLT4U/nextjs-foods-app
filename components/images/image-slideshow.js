'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

import burgerImg from '@/assets/amala-and-ewedu.jpg';
import curryImg from '@/assets/fufu.jpg';
import dumplingsImg from '@/assets/garri.jpg';
import macncheeseImg from '@/assets/ogbono-soup.jpg';
import pizzaImg from '@/assets/egusi-soup.jpg';
import schnitzelImg from '@/assets/jollof-rice.jpg';
import tomatoSaladImg from '@/assets/tomato-salad.jpg';
import classes from './image-slideshow.module.css';

const images = [
  { image: burgerImg, alt: 'A delicious, amala & ewedu' },
  { image: curryImg, alt: 'A delicious, fufu' },
  { image: dumplingsImg, alt: 'garri' },
  { image: macncheeseImg, alt: 'ogbono-soup' },
  { image: pizzaImg, alt: 'A delicious egusi-soup' },
  { image: schnitzelImg, alt: 'A delicious jollof-rice' },
  { image: tomatoSaladImg, alt: 'A delicious tomato salad' },
];

export default function ImageSlideshow() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex < images.length - 1 ? prevIndex + 1 : 0
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={classes.slideshow}>
      {images.map((image, index) => (
        <Image
          key={index}
          src={image.image}
          className={index === currentImageIndex ? classes.active : ''}
          alt={image.alt}
        />
      ))}
    </div>
  );
}
