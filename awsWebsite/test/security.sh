#! /bin/sh

curl -v -d '{"directive":{"header":{"namespace":"Alexa.Discovery","name":"Discover","payloadVersion":"3","messageId":"3f93e5a7-696a-40d7-97f8-e85adee9e839"},"payload":{}}}' -X POST https://homebridge.cloudwatch.net/api/v2/messages

curl -v https://homebridge.cloudwatch.net/auth/start\?client_id=1\&response_type=code\&state=A2SAAEAEC_ByGki9ht_TrK8idN-CbQBsNDf-G93pCKMU8CtXk6z2blnk7x2GBtQSFWOaolNPF_B_m8lRa2-HqG43sMU08r5utXk2Xo-PU9akIYk99EWJGOjgcGLKQNdwrGOcteK7EmOJSeI4fAmwgH0v6zm-AKgkUXaN4pVl80a_SQL8bkunB4r3Vp2kSBBpxX8nX0L_g2uN9WatqtdBrZGMmG2munSMEJOVrXGyA5swalLXv85UHtD9oBm8ppsGj3N7uVF8DavIxpLPRCdk1mNT2tH_tm-papL-dM25MQKEYplckl79eC8FltqxuY7MhTnSnNJhk3BS__WYnPDo0FAz8KKPE2i1b25-geaJsZY_opCEaqVu0B3mHGFzTCJ2zQeFa_VysBdjfS-7mSDC6scmGIJnxlqRJaz2xs2zP07ETRf9962Atma8O_8-TukN-Kh3dx3Y1dElNTtr-y_iQwpLelhwgwD0thpt78cCqcIs6qteZIsOSSQ9w0pGKoMQsYiM8lfUktmBFLH60FEv0aUDXRtBI8s0FQR0UjePBsLZkLK4VGNipV34bInBdZ-yo0LO9L8nUfUc_tF4y0yuW2n3UMtxw4-ZQ\&scope=access_devices\&redirect_uri=https%3A%2F%2Fpitangui.amazon.com%2Fapi%2Fskill%2Flink%2FM1A1OFEFX83Z2S

curl -v https://homebridge.cloudwatch.net/auth/start
