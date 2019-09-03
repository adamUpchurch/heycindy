// var Stripe = require('stripe')

const stripe = Stripe('sk_test_oFR2ODqUhaqxkBa8ayUnlAZa');

var checkoutButton = document.getElementById('checkout-button-sku_FjYx6NqSUk6ZIO');
checkoutButton.addEventListener('click',  () => {
  // When the customer clicks on the button, redirect
  // them to Checkout.
  stripe.redirectToCheckout({
    items: [{sku: 'sku_FjYx6NqSUk6ZIO', quantity: 1}],

    // Do not rely on the redirect to the successUrl for fulfilling
    // purchases, customers may not always reach the success_url after
    // a successful payment.
    // Instead use one of the strategies described in
    // https://stripe.com/docs/payments/checkout/fulfillment
    successUrl: window.location.protocol + '//localhost:3000/dashboard',
    cancelUrl: window.location.protocol + '//localhost:3000/canceled',
  })
  .then(function (result) {
    if (result.error) {
      // If `redirectToCheckout` fails due to a browser or network
      // error, display the localized error message to your customer.
      var displayError = document.getElementById('error-message');
      displayError.textContent = result.error.message;
    }
  });
});