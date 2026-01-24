import { useModalContext } from '@/components/modal/modal-provider';

export function useModal() {
  const { open, close } = useModalContext();
  return { open, close };
}
