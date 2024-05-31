const apiUrl = 'http://localhost:3000/';
const requestBody = {
    user: 'GDFHGWJSZM4Q6MKLIC3DSRAAATB7DPL2UK2D2BMPMR2MEMODT5OLVZL2', // Replace with actual user address
    amount: 123, // Initial amount in XLM
    amount2: 98, // Initial amount2 in XLM
};
const postRequest = async () => {
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Transaction XDR:', data.xdr);
    }
    catch (error) {
        console.error('Error posting request:', error);
    }
};
postRequest();
export {};
