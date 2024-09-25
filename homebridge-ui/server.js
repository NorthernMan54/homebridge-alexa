const axios = require('axios')
const { HomebridgePluginUiServer, RequestError } = require('@homebridge/plugin-ui-utils');

class UiServer extends HomebridgePluginUiServer {
	constructor() {
		super();

		this.endpointUrl = 'https://app.ecpiot.co.il/mobile/mobilecommand';
		this.imei;

		// create request handlers
		this.onRequest('/request-otp', this.requestOtp.bind(this));
		this.onRequest('/check-otp', this.checkOtp.bind(this));

		// must be called when the script is ready to accept connections
		this.ready();
	}


	/**
   * Handle requests sent to /request-otp
   */
	async requestOtp(body) {
		this.imei = this.generateIMEI();

		const data = {
			'pvdid': 1,
			'id': 99,
			'cmd': 'SEND_OTP',
			'data': {
				'imei': this.imei,
				'phone': body.phone,
			}
		}

		try {
			const response = await axios.post(this.endpointUrl, data);
			return response.data;
		} catch (e) {
			throw e.response.data;
		}
	}

	/**
   * Handle requests sent to /check-otp
   */
	async checkOtp(body) {
		const data = {
			'pvdid': 1,
			'id': 99,
			'cmd': 'CHECK_OTP',
			'data': {
				'imei': this.imei,
				'phone': body.phone,
				'code': body.code,
				'os': 'android',
				'osver': 'M4B30Z'
			}
		}

		let response;

		try {
			response = await axios.post(this.endpointUrl, data);
		} catch (e) {
			throw new RequestError(e.response ? e.response.data : e.message);
		}

		if (response.data.data && response.data.data.token) {
			return {
				imei: this.imei,
				token: response.data.data.token,
			}
		} else {
			throw new RequestError(`Could NOT get the token: ${response.data.data ? response.data.data.res_desc : JSON.stringify(response.data)}`);
		}
	}

	generateIMEI() {
		const min = Math.pow(10, 7)
		const max = Math.pow(10, 8) - 1
		return '2b950000' + (Math.floor(Math.random() * (max - min) + min) + 1)
	}
}

// start the instance of the class
(() => {
	return new UiServer;
})();