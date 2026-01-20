export const useAuthModal = () => {
  const open = useState<boolean>('auth-modal-open', () => false)

  const openModal = () => {
    open.value = true
  }
  const closeModal = () => {
    open.value = false
  }

  return {
    open,
    openModal,
    closeModal,
  }
}
