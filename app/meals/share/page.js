'use client';

import { useFormState } from 'react-dom';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import ImagePicker from '@/components/meals/image-picker';
import classes from './page.module.css';
import { shareMeal } from '@/lib/actions';
import MealsFormSubmit from '@/components/meals/meals-form-submit';

export default function ShareMealPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [state, formAction] = useFormState(shareMeal, { message: null });
  const router = useRouter();

  useEffect(() => {
    if (state.message === '') {
      // Success case - redirect to meals page
      router.push('/meals');
      router.refresh(); // Ensure new data is loaded
    }
  }, [state, router]);

  return (
    <>
      <header className={classes.header}>
        <h1>
          Share your <span className={classes.highlight}>favorite meal</span>
        </h1>
        <p>Or any other meal you feel needs sharing!</p>
      </header>
      <main className={classes.main}>
        <form 
          className={classes.form} 
          action={async (formData) => {
            setIsSubmitting(true);
            await formAction(formData);
            setIsSubmitting(false);
          }}
        >
          <div className={classes.row}>
            <p>
              <label htmlFor="name">Your name</label>
              <input type="text" id="name" name="name" required />
            </p>
            <p>
              <label htmlFor="email">Your email</label>
              <input type="email" id="email" name="email" required />
            </p>
          </div>
          <p>
            <label htmlFor="title">Title</label>
            <input type="text" id="title" name="title" required />
          </p>
          <p>
            <label htmlFor="summary">Short Summary</label>
            <input type="text" id="summary" name="summary" required />
          </p>
          <p>
            <label htmlFor="instructions">Instructions</label>
            <textarea
              id="instructions"
              name="instructions"
              rows="10"
              required
            ></textarea>
          </p>
          <ImagePicker label="Your image" name="image" />
          {state.message && state.message !== '' && (
            <p className={classes.error}>{state.message}</p>
          )}
          <p className={classes.actions}>
            <MealsFormSubmit disabled={isSubmitting} />
          </p>
        </form>
      </main>
    </>
  );
}