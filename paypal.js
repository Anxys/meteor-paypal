Meteor.Paypal = {

  account_options: {},
  //authorize submits a payment authorization to Paypal
  authorizeCreditCard: function(card_info, payment_info, callback){
    Meteor.call('create_creditcard_payment', 'authorize', card_info, payment_info, callback);
  },
  purchaseCreditCard: function(card_info, payment_info, callback){
    Meteor.call('create_creditcard_payment', 'sale', card_info, payment_info, callback);
  },
  authorizePayPal: function(payment_info,return_url, cancel_url, callback){
    Meteor.call('create_paypal_payment', 'authorize', payment_info, return_url, cancel_url, callback);
  },
  purchasePayPal: function(payment_info, callback){
    Meteor.call('create_paypal_payment', 'sale', payment_info, return_url, cancel_url, callback);
  },
  executePayment: function(payerId, paymentId, callback){
    Meteor.call('execute_paypal_payment', payerId, paymentId, callback);
  },
  //config is for the paypal configuration settings.
  config: function(options){
    this.account_options = options;
  },
  creditcard_payment_json: function(){
    return {
      "intent": "sale",
      "payer": {
        "payment_method": "credit_card",
        "funding_instruments": []},
      "transactions": []
    };
  },
  payment_json: function(){
    return {
      "intent": "sale",
      "payer": {
        "payment_method": "paypal",
      },
      "redirect_urls": {
        "return_url": "",
        "cancel_url": ""
      },
      "transactions": []
    };
  },
  executePayment_json: function(){
    return {
      "payer_id" : "Appended to redirect url" 
    };
  },
  parsePayPalResponse: function(paypalResponse){
    var url = Npm.require('url');
    for (var index = 0; index < paypalResponse.links.length; index++) {
      if (paypalResponse.links[index].rel === 'approval_url') {
        var approval_url = paypalResponse.links[index].href;
                return {
                  reponse: {
                    approval_url: approval_url,
                    token: url.parse(approval_url, true).query.token
                  }
                };
      }
    }
  },
  //parseCardData splits up the card data and puts it into a paypal friendly format.
  parseCardData: function(data){
    var first_name = '', last_name = '';
    if (data.name){
      first_name = data.name.split(' ')[0];
      last_name = data.name.split(' ')[1]
    }
    return {
      credit_card: {
        type: data.type,
        number: data.number,
        first_name: first_name,
        last_name: last_name,
        cvv2: data.cvv2,
        expire_month: data.expire_month,
        expire_year: data.expire_year
      }};
  },
  //parsePaymentData splits up the card data and gets it into a paypal friendly format.
  parsePaymentData: function(data){
    return {amount: {total: data.total, currency: data.currency}};
  }
};

if(Meteor.isServer){
  Meteor.startup(function(){
    var paypal_sdk = Npm.require('paypal-rest-sdk');
    var Fiber = Npm.require('fibers');
    var Future = Npm.require('fibers/future');
    Meteor.methods({
      create_creditcard_payment: function(transaction_type, cardData, paymentData){
        paypal_sdk.configure(Meteor.Paypal.account_options);
        var payment_json = Meteor.Paypal.creditcard_payment_json();
        payment_json.intent = transaction_type;
        payment_json.payer.funding_instruments.push(Meteor.Paypal.parseCardData(cardData));
        payment_json.transactions.push(Meteor.Paypal.parsePaymentData(paymentData));
        var fut = new Future();
        this.unblock();
        paypal_sdk.payment.create(payment_json, Meteor.bindEnvironment(function(err, payment){
          if (err){
            fut.return({saved: false, error: err});
          } else {
            fut.return({saved: true, payment: payment});
          }
        },
        function(e){
          console.error(e);
        }));
        return fut.wait();
    },
    create_paypal_payment: function(transaction_type, paymentData, returnUrl, cancelUrl){
        paypal_sdk.configure(Meteor.Paypal.account_options);
        var payment_json = Meteor.Paypal.payment_json();
        payment_json.intent = transaction_type;
        payment_json.redirect_urls.return_url = returnUrl;
        payment_json.redirect_urls.cancel_url = cancelUrl;
        payment_json.transactions.push(Meteor.Paypal.parsePaymentData(paymentData));
        var fut = new Future();
        this.unblock();
        paypal_sdk.payment.create(payment_json, Meteor.bindEnvironment(function(err, payment){
          if (err){
            fut.return({saved: false, error: err});
          } else {
            fut.return({saved: true, payment: payment});
          }
        },
        function(e){
          console.error(e);
        }));
        return fut.wait();
      },
      execute_paypal_payment: function(payerId, paymentId){
        paypal_sdk.configure(Meteor.Paypal.account_options);
        var json =  Meteor.Paypal.executePayment_json();
        json.payer_id = payerId;
        var fut = new Future();
        this.unblock();
        paypal_sdk.payment.execute(paymentId, json, Meteor.bindEnvironment(function(err, payment){
          if (err){
            fut.return({saved: false, error: err});
          } else {
            fut.return({saved: true, payment: payment});
          }
        },
        function(e){
          console.error(e);
        }));
        return fut.wait();
      }
    });
  });
}

