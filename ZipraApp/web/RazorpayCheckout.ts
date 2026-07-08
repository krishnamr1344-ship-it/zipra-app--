const RazorpayCheckout = {
  open: (options: any) => {
    return new Promise<{razorpay_payment_id: string; razorpay_signature: string; razorpay_order_id: string}>((resolve, reject) => {
      const rzp = new (window as any).Razorpay({
        ...options,
        handler: (response: any) => {
          resolve({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            razorpay_order_id: response.razorpay_order_id,
          });
        },
        modal: {
          ondismiss: () => reject(new Error('Payment cancelled')),
        },
      });
      rzp.open();
    });
  },
};

export default RazorpayCheckout;
