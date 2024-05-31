<template>
  <main>
    <div class="topNAV">
      <button v-if="!connectedWallet" @click="connectWallet" id="connect-wallet-btn">Connect Wallet</button>
      <div class="wallet" v-if="connectedWallet">
        <div>
          <p>Connected Wallet: {{ connectedWallet.name }}</p>
          <p>{{ publicKey }}</p>
        </div>
      </div>
    </div>

    <div class="main">
      <h2>MFX Swap</h2>
      <hr>
      <div class="dropdown">
        <label for="currency-select">Currency:</label>
        <select class="dropdown-select" id="currency-select" v-model="selected">
          <option value="XLM">XLM</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="MXM">MXM</option>
        </select>
      </div>

      <div class="slidecontainer">
        <label for="number1">{{ selected }} Amount:</label>
        <input type="number" v-model="number1" id="number1" placeholder="Enter amount">
      </div>

      <div class="slidecontainer">
        <input type="range" min="1" max="7" v-model="sliderValue" class="slider" id="myRange">
        <p>Iterations: <span>{{ sliderValue }}</span></p>
      </div>

      <div class="slidecontainer">
        <button @click="apiFunction" id="go-btn">Go!</button>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
  StellarWalletsKit,
  WalletNetwork,
  XBULL_ID,
  xBullModule,
  FreighterModule
} from '@creit.tech/stellar-wallets-kit';
import axios from 'axios';

const connectedWallet = ref(null);
const publicKey = ref('');
const sliderValue = ref(1);
const number1 = ref(null);
const selected = ref('XLM');

const kit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: XBULL_ID,
  modules: [
    new xBullModule(),
    new FreighterModule(),
    // Add any other wallet modules you need
  ],
});

const apiFunction = async () => {
  console.log('API Function called');
  console.log('Selected:', selected.value);
  console.log('Number1:', number1.value);
  console.log('Slider Value:', sliderValue.value);

  for (let i = 0; i < sliderValue.value; i++) {
    try {
          const response = await axios.post('http://localhost:3000/', {
            user: publicKey.value,
            amount: number1.value,
            amount2: number1.value * 0.8,
          });

          const xdr = response.data.xdr;
          console.log('XDR:', xdr);

          const { signedXDR } = await kit.sign({
            xdr: xdr,
            publicKey: publicKey.value,
          });

          console.log('Signed XDR:', signedXDR);
          const response2 = await axios.post('http://localhost:3000/submit', {
            signedXdr: signedXDR,
            publicKey: publicKey.value,
          });
          console.log('Response:', response2.data);
        } catch (error) {
          console.error('Error making request:', error);
        }
  }
};

const connectWallet = async () => {
  await kit.openModal({
    onWalletSelected: async (option) => {
      try {
        kit.setWallet(option.id);
        publicKey.value = await kit.getPublicKey();
        connectedWallet.value = option;
        console.log('Public Key:', publicKey.value);
      } catch (err) {
        console.error('Error getting public key:', err);
      }
    },
    onClosed: (err) => {
      if (err) {
        console.error('Modal closed with error:', err);
      } else {
        console.log('Modal closed without error');
      }
    },
    modalTitle: 'Select a Stellar Wallet',
    notAvailableText: 'No wallet available',
    modalDialogStyles: {
      width: '400px',
      height: '300px',
    },
  });
};

onMounted(() => {
  const slider = document.getElementById("myRange");
  const output = document.getElementById("demo");
  if (slider && output) {
    output.innerHTML = slider.value;

    slider.oninput = function() {
      output.innerHTML = this.value;
    };
  }
});
</script>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #202020;
  color: white;
  min-height: 100vh;
}

.topNAV {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  padding: 10px;
}

#connect-wallet-btn {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  background-color: #4da4cd;
  color: white;
  border: none;
  border-radius: 5px;
  transition: background-color 0.3s;
}

#connect-wallet-btn:hover {
  background-color: #4da4cd;
}

.wallet {
  padding: 10px;
}

.main {
  text-align: center;
  width: 100%;
  max-width: 500px;
  background-color: #2a2a2a;
  border: 1px solid #444;
  border-radius: 10px;
  padding: 20px;
  margin: 20px 0;
}

h2 {
  margin-bottom: 10px;
}

hr {
  border: 1px solid #444;
  width: 100%;
}

.slidecontainer {
  margin: 20px 0;
  width: 100%;
}

label {
  display: block;
  margin-bottom: 5px;
}

input[type="number"], .dropdown-select {
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  margin-bottom: 20px;
  font-size: 16px;
  color: black;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
}

#go-btn {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  background-color: #4da4cd;
  color: white;
  border: none;
  border-radius: 5px;
  transition: background-color 0.3s;
}

#go-btn:hover {
  background-color: #4da4cd;
}

.slider {
  -webkit-appearance: none;
  width: 100%;
  height: 5px;
  border-radius: 5px;
  background: #4da4cd;
  outline: none;
  opacity: 0.7;
  -webkit-transition: .2s;
  transition: opacity .2s;
}

.slider:hover {
  opacity: 1;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #4da4cd;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #4da4cd;
  cursor: pointer;
}

.dropdown {
  margin: 20px 0;
}

.dropdown-select {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  color: black;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
}

.dropdown-select option {
  color: black;
  background-color: white;
}
</style>
