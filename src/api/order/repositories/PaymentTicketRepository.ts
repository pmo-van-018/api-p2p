import { RepositoryBase } from '@api/infrastructure/abstracts/RepositoryBase';
import { PaymentTicket } from '@api/order/models/PaymentTicket';
import { EntityRepository, Not } from 'typeorm';
import { Order } from '../models/Order';
import { PaymentTicketCreditDrawBy, PaymentTicketStatus, PaymentTicketType } from '../enums/PaymentTicketEnum';
import { CONTENT_TYPE_BANK } from '@api/payment/models/PaymentMethodField';

@EntityRepository(PaymentTicket)
export class PaymentTicketRepository extends RepositoryBase<PaymentTicket> {
    public async createPaymentTicket(order: Order, gateway: string) {
        const newPaymentTicket = new PaymentTicket();
        newPaymentTicket.orderId = order.id;
        newPaymentTicket.status = PaymentTicketStatus.NEW;
        newPaymentTicket.creditDrawBy = PaymentTicketCreditDrawBy.AUTO;
        newPaymentTicket.amount = order.totalPrice;
        newPaymentTicket.gateway = gateway;
        newPaymentTicket.bankNo = order.paymentMethod.getPaymentMethodField(CONTENT_TYPE_BANK.BANK_NUMBER);
        newPaymentTicket.receiver = order.paymentMethod.getPaymentMethodField(CONTENT_TYPE_BANK.BANK_HOLDER);
        newPaymentTicket.paymentMethodId = order.paymentMethodId;
        newPaymentTicket.type = PaymentTicketType.WITHDRAW;
        newPaymentTicket.note = 'OK';
        return this.save(newPaymentTicket);
    }

    public async checkPaymentTicketProcessing(orderId: string) { 
        const paymentTicket = await this.findOne({
            orderId,
            status: Not(PaymentTicketStatus.CANCEL),
        });
        return !!paymentTicket;
    }

    public async pickUpPaymentTicket(paymentTicketId: string) {
        await this.update({ id: paymentTicketId }, {
            status: PaymentTicketStatus.PICKED,
            pickedAt: new Date(),
        });
    }

    public async cancelPaymentTicket(paymentTicketId: string) {
        await this.update({ id: paymentTicketId }, {
            status: PaymentTicketStatus.CANCEL,
            cancelledAt: new Date(),
        });
    }

    public async completePaymentTicket(paymentTicketId: string) {
        await this.update({ id: paymentTicketId }, {
            status: PaymentTicketStatus.COMPLETED,
            creditDrawAt: new Date(),
        });
    }

    public async updatePaymentTicketPayloadLog(paymentTicketId: string, payload: string) {
        await this.update({ id: paymentTicketId }, {
            payloadLog: payload
        });
    }

    public async getPaymentTicketWithLock(orderRefId: string) {
        return this.createQueryBuilder('pt')
            .innerJoinAndSelect('pt.order', 'order')
            .where('order.refId = :orderRefId', { orderRefId })
            .setLock('pessimistic_write')
            .orderBy('pt.createdAt', 'DESC')
            .getOne();
    }

    public async getTicketByOrderId(orderId: string) {
        return this.findOne({ orderId });
    }
}

