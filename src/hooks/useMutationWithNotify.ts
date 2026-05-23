/**
 * useMutationWithNotify — API mutation + notification birga
 *
 * Ishlatish:
 *   const createProduct = useMutationWithNotify(
 *     (data) => productApi.create(data),
 *     {
 *       onSuccess: () => {
 *         queryClient.invalidateQueries({ queryKey: ['products'] })
 *         navigate('/products')
 *       },
 *       successMessage: t('product.createSuccess'),
 *     }
 *   )
 *
 *   <button onClick={() => createProduct.mutate(formData)}>
 */
import { useMutation } from '@tanstack/react-query'
import { useNotificationStore } from '@store/notification'

interface MutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: Error) => void
  successMessage?: string
  errorMessage?: string
}

export function useMutationWithNotify<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<{ data: TData }>,
  options: MutationOptions<TData, TVariables> = {}
) {
  const notify = useNotificationStore.getState()

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      const res = await mutationFn(variables)
      return res.data
    },
    onSuccess: (data, variables) => {
      if (options.successMessage) {
        notify.success(options.successMessage)
      }
      options.onSuccess?.(data, variables)
    },
    onError: (error: Error) => {
      const message =
        options.errorMessage ||
        (error as unknown as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ||
        error.message ||
        'Something went wrong'
      notify.error(message)
      options.onError?.(error)
    },
  })
}
