this.expires = new Date('2019-01-08T00:27:19.452Z');
var value = true;
console.log('active', this.expires, new Date(), !value);
if (this.expires < new Date() || !value) {
			console.log("false");
			return false;
		} else {
			console.log("true");
			return value;
		}
