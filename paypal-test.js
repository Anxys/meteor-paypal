	testAsyncMulti('Test1', [
		function(test, expect) {
			console.log("test1:");
			Meteor.Paypal.authorizePayPal(
				{
					total: '10',
					currency: 'EUR'
				},"http://return.url","http://cancel.url",
				expect(function(error, results) {
					if (error) {
						console.log(this);
						console.log("error");
						console.log(error);
						console.log(error.response.details)
					}else {
						console.log("results:")
						console.log(results)
						test.isTrue(results.saved,'The Api call failed');
					}
				}));
		}
	]);

	testAsyncMulti('Test2', [
		function(test, expect) {
			console.log("test2:");
			Meteor.Paypal.executePayment('E83TKBWTGEFFY', 'PAY-7XW17766RW045830EKSMIW7I',
				expect(function(error, results) {
					if (error) {
						console.log(this);
						console.log("error");
						console.log(error);
					}else {
						console.log("results:")
						console.log(results)
						test.isTrue(results.saved,'The Api call failed');
					}
				}));
		}
	]);

