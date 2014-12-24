Package.describe({
  summary: 'Fork of a paypal package that helps make restful API calls to Paypal',
  version: "1.0.0"
});

Npm.depends({'paypal-rest-sdk': '0.6.3'});

Package.on_use(function(api){
	api.versionsFrom('METEOR@0.9.2.2');
	api.use('templating', 'client');
	api.add_files('paypal.js', ['client', 'server']);
    api.add_files(['paypal_credit_card_form.html', 'paypal_credit_card_form.js'], 'client');
    api.export('Paypal', ['client', 'server']);
});

Package.on_test(function(api){
  api.use([ 'tinytest', 'test-helpers'],['client', 'server']);
  api.add_files('paypal.js', ['client', 'server']);
  api.add_files('paypal-test.js', ['client', 'server']);
  api.add_files('sample_config.js', ['server']);
});
