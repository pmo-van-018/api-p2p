import { Service } from 'typedi';
import { Operation } from '@api/profile/models/Operation';
import { MerchantPaymentMethodService } from '@api/payment/services/MerchantPaymentMethodService';
import { PaymentMethodError } from '@api/payment/errors/PaymentMethodError';

@Service()
export class GetPaymentMethodAvailabilityUseCase {
  constructor(
    private paymentMethodService: MerchantPaymentMethodService
  ) {
  }
  public async getPaymentMethodAvailability(currentUser: Operation, paymentMethodId: string) {
    const paymentMethod = await this.paymentMethodService.getPaymentMethodAvailability(currentUser.id, paymentMethodId);

    if (!paymentMethod) {
      return PaymentMethodError.PAYMENT_METHOD_NOT_FOUND;
    }

    return {
      hasPost: !!paymentMethod.posts?.length,
      hasOrder: paymentMethod.posts.some(post => !!post.orders.length),
    };
  }
}
