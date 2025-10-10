import { PaymentMethodAvailability } from '@api/payment/types/PaymentMethod';

export class GetPaymentMethodAvailabilityResponse {
  public hasPost: boolean;
  public hasOrder: boolean;
  constructor(data: PaymentMethodAvailability) {
    this.hasPost = data.hasPost;
    this.hasOrder = data.hasOrder;
  }
}
