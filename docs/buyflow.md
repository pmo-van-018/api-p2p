# Buy Order Flow API
## ❯ API create buy order
### Input:
- amount: crypto
- postId: post id
- price: post price


- Authenticate validation
- Check input data

- User ko bị blacklist
- User chưa mua trước đó
-
### Biz validation:
- Check post id found
- Check post status enable
- Check post type BUY
- Check order price === post price
 + Post price = * 10^9
- Check order amount crypto khả dụng
- Tính fiat = Math.ceil(amount * price) => Check min-max amount của post

### Output:
- orderId: order id
---
## ❯ API User confirm pay
### Input
- orderId: order id
### Biz validation:
- Check order status = TO_BE_PAID = 1
---
## ❯ API User cancel order
### Input
- orderId: order id
### Biz validation:
- Check order status = TO_BE_PAID = 1
---
## ❯ API Merchant confirm received money
### Input
- orderId: order id
### Biz validation:
- Check order status = CONFIRM_PAID = 2
---
## ❯ API Merchant send crypto transaction
### Input
- orderId: order id
### Biz validation:
- Check order status = PAID = 3
