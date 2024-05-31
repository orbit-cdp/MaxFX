import fetch from 'node-fetch';

const apiUrl = 'http://localhost:3000/';
const initialRequestBody = {
  user: 'GDFHGWJSZM4Q6MKLIC3DSRAAATB7DPL2UK2D2BMPMR2MEMODT5OLVZL2', // Replace with actual user address
  amount: 123, // Initial amount in XLM
  amount2: 98, // Initial amount2 in XLM,
};

const submitTransactions = async () => {
  try {
    // Create transaction
    const createResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(initialRequestBody)
    });

    if (!createResponse.ok) {
      throw new Error(`HTTP error! status: ${createResponse.status}`);
    }

    const createData = await createResponse.json();
    const signedXdr = createData.xdr;

    // Submit transaction
    const submitResponse = await fetch(`${apiUrl}submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ signedXdr })
    });

    if (!submitResponse.ok) {
      throw new Error(`HTTP error! status: ${submitResponse.status}`);
    }

    const submitData = await submitResponse.json();
    console.log('Transaction submitted successfully:', submitData.result);
  } catch (error) {
    console.error('Error:', error);
  }
};

submitTransactions();
