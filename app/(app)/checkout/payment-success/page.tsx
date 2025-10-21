//types
type PaymentSuccessProps = {
  searchParams: {
    amount: string;
    payment_intent: string;
    redirect_status?: string;
  };
};

//components
import ShowPaymentSuccess from './components/ShowPaymentSuccess';

const PaymentSuccess = ({
  searchParams: { amount, payment_intent },
}: PaymentSuccessProps) => {
  return (
    <>
      {/* <StripeProvider> */}
      <ShowPaymentSuccess amount={amount} paymentIntent={payment_intent} />
      {/* </StripeProvider> */}
    </>
  );
};

export default PaymentSuccess;
