let token =
    localStorage.getItem("token");


// =====================================
// SHOW LOGIN
// =====================================

function showLogin() {

    document
        .getElementById("loginForm")
        .classList.remove("hidden");


    document
        .getElementById("registerForm")
        .classList.add("hidden");


    document
        .getElementById("loginTab")
        .classList.add("active");


    document
        .getElementById("registerTab")
        .classList.remove("active");


    document
        .getElementById("authTitle")
        .textContent =
        "Welcome back";


    document
        .getElementById("authSubtitle")
        .textContent =
        "Sign in to access your account";
}


// =====================================
// SHOW REGISTER
// =====================================

function showRegister() {

    document
        .getElementById("loginForm")
        .classList.add("hidden");


    document
        .getElementById("registerForm")
        .classList.remove("hidden");


    document
        .getElementById("loginTab")
        .classList.remove("active");


    document
        .getElementById("registerTab")
        .classList.add("active");


    document
        .getElementById("authTitle")
        .textContent =
        "Create your account";


    document
        .getElementById("authSubtitle")
        .textContent =
        "Start your NOVA banking journey";
}


// =====================================
// NOTIFICATION
// =====================================

function showNotification(
    message,
    type = "info"
) {

    const notification =
        document.getElementById(
            "notification"
        );


    if (!notification) {

        alert(message);

        return;
    }


    notification.textContent =
        message;


    notification.className =
        "notification show " +
        type;


    setTimeout(() => {

        notification.classList.remove(
            "show"
        );

    }, 3000);
}


// =====================================
// REGISTER
// =====================================

async function register() {

    const name =
        document
            .getElementById("registerName")
            .value
            .trim();


    const email =
        document
            .getElementById("registerEmail")
            .value
            .trim();


    const password =
        document
            .getElementById("registerPassword")
            .value;


    const pin =
        document
            .getElementById("registerPin")
            .value
            .trim();


    if (!name) {

        showNotification(
            "Enter your name.",
            "error"
        );

        return;
    }


    if (!email) {

        showNotification(
            "Enter your email.",
            "error"
        );

        return;
    }


    if (!password) {

        showNotification(
            "Enter a password.",
            "error"
        );

        return;
    }


    if (!/^\d{4}$/.test(pin)) {

        showNotification(
            "PIN must contain exactly 4 digits.",
            "error"
        );

        return;
    }


    try {

        const response =
            await fetch(
                "/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        name,
                        email,
                        password,
                        transactionPin: pin

                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            showNotification(
                data.message ||
                "Registration failed.",
                "error"
            );

            return;
        }


        showNotification(
            "Account created successfully. Account number: " +
            data.accountNumber,
            "success"
        );


        document.getElementById(
            "loginEmail"
        ).value = email;


        document.getElementById(
            "loginPassword"
        ).value = password;


        document.getElementById(
            "registerName"
        ).value = "";


        document.getElementById(
            "registerEmail"
        ).value = "";


        document.getElementById(
            "registerPassword"
        ).value = "";


        document.getElementById(
            "registerPin"
        ).value = "";


        setTimeout(
            showLogin,
            1000
        );


    } catch (error) {

        console.error(error);

        showNotification(
            "Cannot connect to server.",
            "error"
        );
    }
}


// =====================================
// LOGIN
// =====================================

async function login() {

    const email =
        document
            .getElementById("loginEmail")
            .value
            .trim();


    const password =
        document
            .getElementById("loginPassword")
            .value;


    if (!email) {

        showNotification(
            "Enter your email.",
            "error"
        );

        return;
    }


    if (!password) {

        showNotification(
            "Enter your password.",
            "error"
        );

        return;
    }


    try {

        const response =
            await fetch(
                "/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        email,
                        password

                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            showNotification(
                data.message ||
                "Invalid email or password.",
                "error"
            );

            return;
        }


        token =
            data.token;


        localStorage.setItem(
            "token",
            token
        );


        showDashboard();


    } catch (error) {

        console.error(error);

        showNotification(
            "Cannot connect to server.",
            "error"
        );
    }
}


// =====================================
// SHOW DASHBOARD
// =====================================

async function showDashboard() {

    document
        .getElementById("authPage")
        .classList.add("hidden");


    document
        .getElementById("dashboardPage")
        .classList.remove("hidden");


    const success =
        await loadAccount();


    if (!success) {

        logout();

        return;
    }


    await loadTransactions();
}


// =====================================
// LOAD ACCOUNT
// =====================================

async function loadAccount() {

    try {

        const response =
            await fetch(
                "/account",
                {
                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            showNotification(
                data.message ||
                "Unable to load account.",
                "error"
            );

            return false;
        }


        document.getElementById(
            "userName"
        ).textContent =
            data.name;


        document.getElementById(
            "userInitial"
        ).textContent =
            data.name
                .charAt(0)
                .toUpperCase();


        document.getElementById(
            "accountNumber"
        ).textContent =
            data.accountNumber;


        document.getElementById(
            "balance"
        ).textContent =
            formatMoney(data.balance);


        return true;


    } catch (error) {

        console.error(error);

        return false;
    }
}


// =====================================
// DEPOSIT
// =====================================

async function deposit() {

    const amount =
        Number(
            document.getElementById(
                "depositAmount"
            ).value
        );


    const pin =
        document.getElementById(
            "depositPin"
        ).value;


    if (
        !amount ||
        amount <= 0
    ) {

        showNotification(
            "Enter a valid amount.",
            "error"
        );

        return;
    }


    if (!pin) {

        showNotification(
            "Enter your transaction PIN.",
            "error"
        );

        return;
    }


    const response =
        await fetch(
            "/deposit",
            {
                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        "Bearer " + token
                },

                body: JSON.stringify({

                    amount,
                    transactionPin: pin

                })
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        showNotification(
            data.message ||
            "Deposit failed.",
            "error"
        );

        return;
    }


    showNotification(
        "Deposit successful.",
        "success"
    );


    document.getElementById(
        "depositAmount"
    ).value = "";


    document.getElementById(
        "depositPin"
    ).value = "";


    await loadAccount();

    await loadTransactions();
}


// =====================================
// WITHDRAW
// =====================================

async function withdraw() {

    const amount =
        Number(
            document.getElementById(
                "withdrawAmount"
            ).value
        );


    const pin =
        document.getElementById(
            "withdrawPin"
        ).value;


    if (
        !amount ||
        amount <= 0
    ) {

        showNotification(
            "Enter a valid amount.",
            "error"
        );

        return;
    }


    if (!pin) {

        showNotification(
            "Enter your transaction PIN.",
            "error"
        );

        return;
    }


    const response =
        await fetch(
            "/withdraw",
            {
                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        "Bearer " + token
                },

                body: JSON.stringify({

                    amount,
                    transactionPin: pin

                })
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        showNotification(
            data.message ||
            "Withdrawal failed.",
            "error"
        );

        return;
    }


    showNotification(
        "Withdrawal successful.",
        "success"
    );


    document.getElementById(
        "withdrawAmount"
    ).value = "";


    document.getElementById(
        "withdrawPin"
    ).value = "";


    await loadAccount();

    await loadTransactions();
}


// =====================================
// TRANSFER
// =====================================

async function transfer() {

    const receiverAccount =
        document.getElementById(
            "transferAccount"
        ).value.trim();


    const amount =
        Number(
            document.getElementById(
                "transferAmount"
            ).value
        );


    const pin =
        document.getElementById(
            "transferPin"
        ).value;


    if (!receiverAccount) {

        showNotification(
            "Enter receiver account number.",
            "error"
        );

        return;
    }


    if (
        !amount ||
        amount <= 0
    ) {

        showNotification(
            "Enter a valid amount.",
            "error"
        );

        return;
    }


    if (!pin) {

        showNotification(
            "Enter your transaction PIN.",
            "error"
        );

        return;
    }


    const response =
        await fetch(
            "/transfer",
            {
                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        "Bearer " + token
                },

                body: JSON.stringify({

                    receiverAccount,
                    amount,
                    transactionPin: pin

                })
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        showNotification(
            data.message ||
            "Transfer failed.",
            "error"
        );

        return;
    }


    showNotification(
        "Transfer successful.",
        "success"
    );


    document.getElementById(
        "transferAccount"
    ).value = "";


    document.getElementById(
        "transferAmount"
    ).value = "";


    document.getElementById(
        "transferPin"
    ).value = "";


    await loadAccount();

    await loadTransactions();
}


// =====================================
// TRANSACTIONS
// =====================================

async function loadTransactions() {

    try {

        const response =
            await fetch(
                "/transactions",
                {
                    headers: {

                        "Authorization":
                            "Bearer " + token

                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            return;
        }


        const container =
            document.getElementById(
                "transactions"
            );


        container.innerHTML = "";


        if (
            !data.transactions ||
            data.transactions.length === 0
        ) {

            container.innerHTML = `

                <div class="empty">

                    No transactions yet.

                </div>

            `;

            return;
        }


        data.transactions
            .slice(0, 10)
            .forEach(
                transaction => {

                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "transaction";


                    let title =
                        transaction.type;


                    let sign =
                        "";


                    let amountClass =
                        "";


                    if (
                        transaction.type ===
                        "DEPOSIT"
                    ) {

                        title =
                            "Money deposited";

                        sign = "+";

                        amountClass =
                            "positive";

                    } else if (
                        transaction.type ===
                        "WITHDRAW"
                    ) {

                        title =
                            "Money withdrawn";

                        sign = "-";

                        amountClass =
                            "negative";

                    } else if (
                        transaction.type ===
                        "TRANSFER"
                    ) {

                        if (
                            transaction.from_account ===
                            getAccountNumber()
                        ) {

                            title =
                                "Money transferred";

                            sign = "-";

                            amountClass =
                                "negative";

                        } else {

                            title =
                                "Money received";

                            sign = "+";

                            amountClass =
                                "positive";
                        }
                    }


                    item.innerHTML = `

                        <div class="transaction-icon">
                            ${transaction.type === "TRANSFER"
                                ? "→"
                                : "₹"}
                        </div>

                        <div class="transaction-info">

                            <strong>
                                ${title}
                            </strong>

                            <span>
                                ${new Date(
                                    transaction.date
                                ).toLocaleString("en-IN")}
                            </span>

                        </div>

                        <strong
                            class="transaction-amount ${amountClass}">

                            ${sign}
                            ${formatMoney(
                                transaction.amount
                            )}

                        </strong>

                    `;


                    container.appendChild(
                        item
                    );

                }
            );


    } catch (error) {

        console.error(
            "Transaction loading error:",
            error
        );
    }
}


// =====================================
// ACCOUNT NUMBER
// =====================================

function getAccountNumber() {

    return document
        .getElementById(
            "accountNumber"
        )
        .textContent
        .trim();
}


// =====================================
// STATEMENT
// =====================================

async function downloadStatement() {

    try {

        const response =
            await fetch(
                "/statement",
                {
                    headers: {

                        "Authorization":
                            "Bearer " + token

                    }
                }
            );


        if (!response.ok) {

            showNotification(
                "Could not download statement.",
                "error"
            );

            return;
        }


        const blob =
            await response.blob();


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;


        link.download =
            "nova-statement.txt";


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        URL.revokeObjectURL(
            url
        );


        showNotification(
            "Statement downloaded.",
            "success"
        );


    } catch (error) {

        console.error(error);

        showNotification(
            "Statement download failed.",
            "error"
        );
    }
}


// =====================================
// LOGOUT
// =====================================

function logout() {

    localStorage.removeItem(
        "token"
    );


    token = null;


    document
        .getElementById(
            "dashboardPage"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "authPage"
        )
        .classList.remove(
            "hidden"
        );


    showLogin();
}


// =====================================
// FORMAT MONEY
// =====================================

function formatMoney(amount) {

    return Number(amount || 0)
        .toLocaleString(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                minimumFractionDigits: 2
            }
        );
}


// =====================================
// AUTO LOGIN
// =====================================

if (token) {

    showDashboard();

}