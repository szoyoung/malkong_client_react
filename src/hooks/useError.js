import { useState } from 'react';
export default function useError(initial = '') {
  const [error, setError] = useState(initial);
  const resetError = () => setError(initial);
  return { error, setError, resetError };
} 