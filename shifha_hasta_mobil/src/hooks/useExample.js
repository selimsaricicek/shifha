import { useState } from 'react';

// Örnek custom hook
export default function useExample() {
  const [state, setState] = useState(null);
  return [state, setState];
} 