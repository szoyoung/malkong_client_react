import { useState } from 'react';
export default function useLoading(initial = false) {
  const [loading, setLoading] = useState(initial);
  return { loading, setLoading };
} 