export class UpdateOrderStatusDto {
  status!: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}