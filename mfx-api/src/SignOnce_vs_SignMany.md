### Documentation: Sequential Signing vs. Preauthorized Transaction Signing

#### Overview

In the OrbitCDP project, users have two options to sign and submit transactions for leveraging positions on the Stellar network:

1. **Sequential Signing through the Frontend**
2. **Preauthorized Transaction Signing through the API**

Each method has its own workflow and advantages. Below, we explain the differences between these two methods.

---

#### Sequential Signing through the Frontend

**Workflow:**

1. **Transaction Creation**: The frontend communicates with the API to create multiple leverage position transactions.
2. **User Interaction**: The user signs each transaction sequentially using their Stellar wallet.
3. **Submission**: Each signed transaction is submitted to the Stellar network one by one.

**Advantages:**

- **Transparency**: The user has full control over each individual transaction and can review the details before signing.
- **Flexibility**: The user can decide to sign or reject each transaction independently.

**Use Case:**

This method is suitable for users who prefer to have detailed oversight of each transaction in the leverage position process. It allows them to review and approve each step manually.

**Example Workflow in the Frontend:**

1. The user inputs the required details (e.g., user address, amount, iterations).
2. The frontend sends a request to the API to generate the transactions.
3. The user signs each transaction sequentially using their Stellar wallet.
4. The frontend submits each signed transaction to the Stellar network.

---

#### Preauthorized Transaction Signing through the API

**Workflow:**

1. **Transaction Creation**: The API generates multiple leverage position transactions along with a preauthorization transaction.
2. **Single Authorization**: The user signs the preauthorization transaction using their Stellar wallet.
3. **Batch Submission**: Once the preauthorization transaction is submitted, all subsequent transactions are automatically authorized and can be submitted to the Stellar network without further user interaction.

**Advantages:**

- **Efficiency**: The user only needs to sign one transaction, streamlining the process.
- **Automation**: After signing the preauthorization transaction, the system can handle the submission of all subsequent transactions automatically.

**Use Case:**

This method is ideal for users who want a more efficient and automated process. By signing a single preauthorization transaction, they can authorize multiple future transactions without having to sign each one individually.

**Example Workflow Using the Preauthorized Transaction Endpoint:**

1. The user inputs the required details (e.g., user address, amount, iterations) in the frontend.
2. The frontend sends a request to the API to generate the transactions and the preauthorization transaction.
3. The user signs the preauthorization transaction using their Stellar wallet.
4. The API or backend system handles the submission of all subsequent transactions based on the preauthorization.

---

### Key Differences

| Feature                               | Sequential Signing                   | Preauthorized Transaction Signing            |
|---------------------------------------|--------------------------------------|---------------------------------------------|
| User Interaction                      | User signs each transaction manually | User signs only one preauthorization transaction |
| Transparency                          | Full control over each transaction   | Limited control, single preauthorization for all transactions |
| Efficiency                            | More time-consuming                  | Faster and more automated                    |
| Flexibility                           | User can approve/reject each transaction | User authorizes all transactions in one step  |
| Use Case                              | Users preferring detailed oversight  | Users seeking efficiency and automation      |

---

By offering both methods, the OrbitCDP project caters to different user preferences, providing flexibility and efficiency in managing leverage positions on the Stellar network. Users can choose the method that best fits their workflow and control preferences.