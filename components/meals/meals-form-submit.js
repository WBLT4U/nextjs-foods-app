'use client';

import { useFormStatus } from 'react-dom';

export default function MealsFormSubmit({ disabled }) {
  const { pending } = useFormStatus();
  
  return (
    <button disabled={disabled || pending}>
      {pending ? 'Submitting...' : 'Share Meal'}
    </button>
  );
}